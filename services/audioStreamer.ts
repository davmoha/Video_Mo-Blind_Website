/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ultra-low latency Web Audio PCM Streamer & Pre-buffering Player
 * 
 * Optimized for Gemini TTS and Live audio streams (raw 16-bit PCM, 24kHz / 16kHz).
 * Reuses a single warm AudioContext, schedules audio chunks gaplessly on the timeline,
 * and handles smooth interruption ramps without audio clicks or latency bottlenecks.
 */

export class PCMAudioStreamer {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sampleRate: number;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isPlayingState: boolean = false;
  private onEndedCallback: (() => void) | null = null;
  private checkCompletionTimer: any = null;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
  }

  /**
   * Initializes or returns the warm AudioContext singleton.
   * Calling this during a user gesture (e.g. dial, button click) ensures
   * the audio hardware is primed with zero first-play latency.
   */
  public getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: this.sampleRate });
      
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch((err) => {
        console.warn("AudioContext resume pending user interaction:", err);
      });
    }

    return this.audioCtx;
  }

  /**
   * Fast base64 string to Float32 AudioBuffer decoder
   */
  public decodeBase64ToBuffer(base64: string, targetSampleRate?: number): AudioBuffer {
    const ctx = this.getAudioContext();
    const sRate = targetSampleRate || this.sampleRate;
    
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 16-bit PCM little-endian
    const int16 = new Int16Array(bytes.buffer);
    const numSamples = int16.length;
    
    const audioBuffer = ctx.createBuffer(1, numSamples, sRate);
    const channelData = audioBuffer.getChannelData(0);

    // Normalize 16-bit signed integer [-32768, 32767] to Float32 [-1.0, 1.0]
    for (let i = 0; i < numSamples; i++) {
      channelData[i] = int16[i] / 32768.0;
    }

    return audioBuffer;
  }

  /**
   * Pre-buffers and plays a complete PCM base64 string with minimal latency.
   */
  public playPCM(base64: string, onEnded?: () => void, targetSampleRate?: number): void {
    // Smoothly stop any prior audio without popping
    this.stop();

    try {
      const ctx = this.getAudioContext();
      const buffer = this.decodeBase64ToBuffer(base64, targetSampleRate);
      
      this.onEndedCallback = onEnded || null;
      this.isPlayingState = true;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
        source.connect(this.masterGain);
      } else {
        source.connect(ctx.destination);
      }

      // Schedule immediately with a tiny 15ms lead to avoid buffer underrun
      const startTime = ctx.currentTime + 0.015;
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.add(source);

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          this.isPlayingState = false;
          if (this.onEndedCallback) {
            const cb = this.onEndedCallback;
            this.onEndedCallback = null;
            cb();
          }
        }
      };

      source.start(startTime);
    } catch (e) {
      console.error("PCM Audio Streaming playback error:", e);
      this.isPlayingState = false;
      if (onEnded) onEnded();
    }
  }

  /**
   * Queues an audio chunk into a continuous gapless playback pipeline.
   * Useful for streaming TTS or Live audio chunks.
   */
  public queueChunk(base64: string, onEnded?: () => void, targetSampleRate?: number): void {
    try {
      const ctx = this.getAudioContext();
      const buffer = this.decodeBase64ToBuffer(base64, targetSampleRate);

      if (onEnded) {
        this.onEndedCallback = onEnded;
      }
      this.isPlayingState = true;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      if (this.masterGain) {
        source.connect(this.masterGain);
      } else {
        source.connect(ctx.destination);
      }

      // Schedule at the end of the previous buffer, or now + 15ms if queue was empty
      const now = ctx.currentTime;
      const startTime = Math.max(now + 0.015, this.nextStartTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.add(source);

      source.onended = () => {
        this.activeSources.delete(source);
        // Check if all scheduled audio has finished
        if (this.activeSources.size === 0 && ctx.currentTime >= this.nextStartTime - 0.05) {
          this.isPlayingState = false;
          if (this.onEndedCallback) {
            const cb = this.onEndedCallback;
            this.onEndedCallback = null;
            cb();
          }
        }
      };

      source.start(startTime);
    } catch (e) {
      console.error("Failed to queue PCM chunk:", e);
    }
  }

  /**
   * Smoothly stops all active and queued audio sources with a fast 10ms micro-fade
   * to eliminate speaker clicks or pops when interrupted by the user.
   */
  public stop(): void {
    if (this.checkCompletionTimer) {
      clearTimeout(this.checkCompletionTimer);
      this.checkCompletionTimer = null;
    }

    if (this.audioCtx && this.masterGain && this.audioCtx.state === 'running') {
      try {
        const now = this.audioCtx.currentTime;
        // Fast 10ms fade out
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.01);
      } catch (e) {}
    }

    // Stop and disconnect all active sources
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.activeSources.clear();

    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }

    this.isPlayingState = false;
    this.onEndedCallback = null;
  }

  /**
   * Returns whether audio is currently playing or queued
   */
  public isPlaying(): boolean {
    return this.isPlayingState;
  }
}

// Export singleton instance for the app
export const globalAudioStreamer = new PCMAudioStreamer(24000);
