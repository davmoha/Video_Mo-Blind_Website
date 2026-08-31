import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Film, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Workflow, 
  Check, 
  PhoneCall,
  Upload,
  Maximize,
  Minimize,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveVideoBlob, getVideoBlob, clearVideoBlob } from '../services/videoStorage';

interface VideoSectionProps {
  youtubeVideoId?: string; // YouTube ID or URL
  videoFileUrl?: string;   // Hosted video file URL (e.g. /assets/mo-blind-video.mp4)
  videoTitle?: string;
  videoDescription?: string;
  onBookCall?: () => void;
}

// 6 Cinematic Scenes directly matching the user's philosophy video
const VIDEO_SCENES = [
  {
    id: 1,
    duration: 7,
    tag: "SCENE 01 • THE PROBLEM",
    badgeColor: "from-red-500/20 to-orange-500/20 text-rose-400 border-rose-500/30",
    headline: "MOST AI PROJECTS FAIL",
    subheadline: "Why 85% of AI initiatives crash before generating a single dollar of ROI.",
    bulletPoints: [
      "Companies rush to buy AI tools without fixing root workflows",
      "Software bloat creates confusion instead of speed",
      "You cannot out-automate a broken process"
    ],
    theme: "danger"
  },
  {
    id: 2,
    duration: 8,
    tag: "SCENE 02 • THE COMPLEXITY TRAP",
    badgeColor: "from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30",
    headline: "MORE TOOLS ≠ MORE PROFIT",
    subheadline: "Throwing bots at disconnected spreadsheets only multiplies the chaos.",
    bulletPoints: [
      "Fragmented CRMs and lost customer inquiries",
      "Double data entry and human burnout",
      "Expensive software subscriptions gathering dust"
    ],
    theme: "warning"
  },
  {
    id: 3,
    duration: 9,
    tag: "SCENE 03 • OUR CORE BELIEF",
    badgeColor: "from-[#1AD1B5]/20 to-[#855df6]/20 text-[#1AD1B5] border-[#1AD1B5]/30",
    headline: "WE DON'T SELL AI. WE SELL OUTCOMES.",
    subheadline: "Technology is only valuable when it recovers lost revenue and frees your team.",
    bulletPoints: [
      "Every system must produce measurable dollars and hours saved",
      "Sometimes the answer is an AI Voice Agent",
      "Sometimes it's a simple, elegant process fix"
    ],
    theme: "teal"
  },
  {
    id: 4,
    duration: 8,
    tag: "SCENE 04 • DIAGNOSTIC METHOD",
    badgeColor: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
    headline: "WE DIAGNOSE BEFORE WE PRESCRIBE",
    subheadline: "Our combat-medic framework audits your bottlenecks before writing a single line of code.",
    bulletPoints: [
      "Phase 1: Deep Triage & Bottleneck Audit",
      "Phase 2: Standardize & Lean Workflow SOPs",
      "Phase 3: Deploy Custom AI & Secure Integrations"
    ],
    theme: "blue"
  },
  {
    id: 5,
    duration: 8,
    tag: "SCENE 05 • THE AUTOMATION ENGINE",
    badgeColor: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
    headline: "YOUR 24/7 REVENUE MACHINE",
    subheadline: "Autonomous dispatchers, CRM sync, and custom SaaS platforms built specifically for you.",
    bulletPoints: [
      "100% of missed calls answered & booked in real-time",
      "Zero manual data entry between your favorite tools",
      "Secure, HIPAA/SOC-ready enterprise infrastructure"
    ],
    theme: "green"
  },
  {
    id: 6,
    duration: 8,
    tag: "SCENE 06 • BRING 'EM CLOSE",
    badgeColor: "from-[#1AD1B5]/20 to-purple-500/20 text-[#1AD1B5] border-[#1AD1B5]/40",
    headline: "MO-BLIND SOLUTIONS",
    subheadline: "Ready to simplify your business and scale operations?",
    bulletPoints: [
      "Get your Custom AI & Process Blueprint",
      "Transparent pricing starting from $297/mo",
      "Schedule your 15-minute diagnostic audit today"
    ],
    theme: "brand"
  }
];

export const VideoSection: React.FC<VideoSectionProps> = ({
  youtubeVideoId = "https://youtu.be/DRgf5DnR3w0?si=mTlYbXzerDQbAmSI",
  videoFileUrl = "",
  videoTitle = "We Don't Sell AI. We Sell Business Outcomes.",
  videoDescription = "Watch our video on how Mo-Blind diagnoses operational bottlenecks before deploying AI voice agents, automations, or custom software.",
  onBookCall
}) => {
  // Video Source States
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasNativeVideo, setHasNativeVideo] = useState(false);

  // Native Video Player States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Slideshow Fallback States
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. Initialize Video from IndexedDB or props
  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    async function initVideoSource() {
      // Check IndexedDB for previously saved video blob
      const storedBlob = await getVideoBlob();
      if (storedBlob) {
        const url = URL.createObjectURL(storedBlob);
        objectUrlToRevoke = url;
        setActiveVideoSrc(url);
        setHasNativeVideo(true);
        return;
      }

      // Check videoFileUrl prop or static asset
      if (videoFileUrl) {
        setActiveVideoSrc(videoFileUrl);
        setHasNativeVideo(true);
        return;
      }

      // Try checking if /assets/mo-blind-video.mp4 is available
      try {
        const res = await fetch('/assets/mo-blind-video.mp4', { method: 'HEAD' });
        if (res.ok) {
          setActiveVideoSrc('/assets/mo-blind-video.mp4');
          setHasNativeVideo(true);
        }
      } catch {}
    }

    initVideoSource();

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [videoFileUrl]);

  // Clean YouTube ID extraction if YouTube is provided
  const cleanYoutubeId = React.useMemo(() => {
    if (!youtubeVideoId || youtubeVideoId.includes("dQw4w9WgXcQ")) return "";
    const match = youtubeVideoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : youtubeVideoId;
  }, [youtubeVideoId]);

  const embedUrl = cleanYoutubeId
    ? `https://www.youtube-nocookie.com/embed/${cleanYoutubeId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  // File Upload / Drop handler for MP4 video
  const handleVideoFile = async (file: File) => {
    if (!file || !file.type.startsWith('video/')) {
      alert("Please upload a valid MP4 or WebM video file.");
      return;
    }

    try {
      await saveVideoBlob(file);
      const url = URL.createObjectURL(file);
      setActiveVideoSrc(url);
      setHasNativeVideo(true);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Failed to cache video in IndexedDB:", err);
      const url = URL.createObjectURL(file);
      setActiveVideoSrc(url);
      setHasNativeVideo(true);
      setIsPlaying(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoFile(e.target.files[0]);
    }
  };

  // Video Native Playback Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  // Helper for formatting time (mm:ss)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sound generator for subtle high-tech transition tones (Slideshow fallback)
  const playTechTone = (freq: number, type: OscillatorType = 'sine', dur: number = 0.15) => {
    if (isAudioMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {}
  };

  // Auto-progress timer for interactive slideshow fallback
  useEffect(() => {
    if (!isPlaying || hasNativeVideo || embedUrl || isPaused) return;

    const currentScene = VIDEO_SCENES[currentSceneIdx];
    const tickInterval = 50;
    const totalTicks = (currentScene.duration * 1000) / tickInterval;

    const interval = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          const nextIdx = (currentSceneIdx + 1) % VIDEO_SCENES.length;
          setCurrentSceneIdx(nextIdx);
          playTechTone(440 + nextIdx * 110, 'sine', 0.2);
          return 0;
        }
        return prev + (100 / totalTicks);
      });
    }, tickInterval);

    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIdx, isPaused, hasNativeVideo, embedUrl, isAudioMuted]);

  const currentScene = VIDEO_SCENES[currentSceneIdx];

  const handleNextScene = () => {
    setCurrentSceneIdx((curr) => (curr + 1) % VIDEO_SCENES.length);
    setSceneProgress(0);
    playTechTone(600, 'sine', 0.15);
  };

  const handlePrevScene = () => {
    setCurrentSceneIdx((curr) => (curr - 1 + VIDEO_SCENES.length) % VIDEO_SCENES.length);
    setSceneProgress(0);
    playTechTone(400, 'sine', 0.15);
  };

  const handleRestart = () => {
    if (hasNativeVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      setCurrentSceneIdx(0);
      setSceneProgress(0);
      playTechTone(520, 'sine', 0.2);
    }
  };

  return (
    <section id="video-overview" className="relative z-10 py-16 md:py-24 bg-[#070A10] border-y border-white/5 overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept="video/mp4,video/webm,video/*" 
        className="hidden" 
      />

      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#1AD1B5]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#1AD1B5] bg-[#1AD1B5]/10 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 mb-4"
          >
            <Film className="w-3.5 h-3.5 text-[#1AD1B5]" />
            <span>Featured Video Presentation</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-sans leading-tight"
          >
            We Don't Sell AI. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] via-[#31a2b0] to-[#855df6]">
              We Sell Outcomes That Scale.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-gray-300 font-light mt-3 leading-relaxed"
          >
            {videoDescription}
          </motion.p>
        </div>

        {/* Video Screen Container */}
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          className={`relative max-w-4xl mx-auto rounded-3xl overflow-hidden border transition-all duration-300 bg-[#0A0D15] shadow-2xl shadow-teal-950/40 group ${
            isDragOver ? 'border-[#1AD1B5] ring-4 ring-[#1AD1B5]/30' : 'border-white/10'
          }`}
        >
          {/* Top Quick Actions Bar (Upload / Switcher) */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black/70 hover:bg-[#1AD1B5] text-gray-300 hover:text-black border border-white/15 hover:border-transparent px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-lg cursor-pointer"
              title="Replace or upload attached MP4 video"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasNativeVideo ? 'Replace Video' : 'Load Video (.mp4)'}</span>
            </button>

            {hasNativeVideo && (
              <button
                onClick={async () => {
                  await clearVideoBlob();
                  setActiveVideoSrc('');
                  setHasNativeVideo(false);
                  setIsPlaying(false);
                }}
                className="bg-black/70 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/15 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono transition-all duration-300 cursor-pointer"
                title="Reset to interactive presentation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 16:9 Video Canvas */}
          <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden bg-black select-none">
            
            {/* Case 1: Native MP4 Video File Player */}
            {hasNativeVideo && activeVideoSrc ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeVideoSrc}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {/* Big Center Play Overlay when Paused */}
                {!isPlaying && (
                  <div 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer backdrop-blur-[2px] transition-all"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1AD1B5] to-[#855df6] flex items-center justify-center text-black shadow-2xl shadow-teal-500/50 hover:scale-110 transition-transform">
                      <Play className="w-9 h-9 fill-black ml-1 text-black" />
                    </div>
                  </div>
                )}

                {/* Custom Sleek Video Controls Bar */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-2 z-20 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Progress Scrub Bar */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#1AD1B5] hover:h-2 transition-all"
                  />

                  <div className="flex items-center justify-between text-xs font-mono text-white">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={togglePlay} 
                        className="hover:text-[#1AD1B5] transition-colors p-1"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <button 
                        onClick={handleRestart} 
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        title="Restart Video"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={toggleMute} 
                          className="hover:text-[#1AD1B5] transition-colors p-1"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#1AD1B5]"
                        />
                      </div>

                      <span className="text-[11px] text-gray-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.playbackRate = videoRef.current.playbackRate === 1 ? 1.25 : videoRef.current.playbackRate === 1.25 ? 1.5 : 1;
                          }
                        }}
                        className="text-[11px] text-gray-300 hover:text-[#1AD1B5] px-2 py-0.5 rounded bg-white/10"
                      >
                        {videoRef.current?.playbackRate || 1}x
                      </button>

                      <button 
                        onClick={toggleFullscreen} 
                        className="hover:text-[#1AD1B5] transition-colors p-1"
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : isPlaying && embedUrl ? (
              /* Case 2: External YouTube Embed */
              <iframe
                src={embedUrl}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : isPlaying ? (
              /* Case 3: Interactive Full-Motion 6-Scene Philosophy Video Player */
              <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-[#060A12] via-[#090E18] to-[#04060A] text-white">
                
                {/* Cyber Perspective Grid Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#1AD1B518_1px,transparent_1px),linear-gradient(to_bottom,#1AD1B518_1px,transparent_1px)] bg-[size:32px_32px]" />
                
                {/* Top Control Bar */}
                <div className="relative z-20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1AD1B5] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1AD1B5]"></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#1AD1B5] uppercase">
                      Scene {currentSceneIdx + 1} / {VIDEO_SCENES.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="text-gray-400 hover:text-white text-xs font-mono p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title={isAudioMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
                    >
                      {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#1AD1B5]" />}
                    </button>

                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="text-gray-300 hover:text-white text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPaused ? <Play className="w-3 h-3 text-[#1AD1B5]" /> : <Pause className="w-3 h-3" />}
                      <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
                    </button>

                    <button
                      onClick={handleRestart}
                      className="text-gray-400 hover:text-white text-xs font-mono p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Restart Video"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Dynamic Video Slide Content */}
                <div className="relative z-10 my-auto w-full max-w-2xl mx-auto text-center px-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSceneIdx}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.05, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="flex flex-col items-center"
                    >
                      {/* Scene Badge */}
                      <span className={`text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border bg-gradient-to-r ${currentScene.badgeColor} mb-4`}>
                        {currentScene.tag}
                      </span>

                      {/* Display Headline */}
                      <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-sans leading-tight">
                        {currentScene.headline.includes("WE DON'T SELL AI") ? (
                          <>
                            WE DON'T SELL AI. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] via-[#31a2b0] to-[#855df6]">
                              WE SELL OUTCOMES.
                            </span>
                          </>
                        ) : currentScene.headline.includes("FAIL") ? (
                          <span className="text-rose-400 font-mono tracking-wider">
                            {currentScene.headline}
                          </span>
                        ) : (
                          currentScene.headline
                        )}
                      </h3>

                      {/* Subheadline description */}
                      <p className="text-xs sm:text-sm text-gray-300 font-light mt-3 max-w-lg leading-relaxed">
                        {currentScene.subheadline}
                      </p>

                      {/* Bullet Takeaways */}
                      <div className="mt-5 grid grid-cols-1 gap-2 w-full max-w-lg text-left">
                        {currentScene.bulletPoints.map((bullet, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.1 }}
                            className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-xs text-xs sm:text-sm text-gray-200"
                          >
                            {currentScene.theme === 'danger' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            ) : currentScene.theme === 'warning' ? (
                              <Workflow className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-[#1AD1B5] shrink-0" />
                            )}
                            <span className="font-light">{bullet}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA inside Scene 6 */}
                      {currentScene.id === 6 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 flex flex-wrap gap-3 justify-center"
                        >
                          <button
                            onClick={onBookCall}
                            className="bg-[#1AD1B5] hover:bg-[#15bda3] text-black font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
                          >
                            <span>Schedule Strategy Audit</span>
                            <ArrowRight className="w-3.5 h-3.5 text-black" />
                          </button>
                          <a
                            href="tel:8137040306"
                            className="bg-white/10 hover:bg-white/20 text-white font-mono font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider border border-white/10 flex items-center gap-2"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-[#1AD1B5]" />
                            <span>(813) 704-0306</span>
                          </a>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Timeline Controls */}
                <div className="relative z-20 space-y-3">
                  {/* Active Scene Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#1AD1B5] to-[#855df6] transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${sceneProgress}%` }}
                    />
                  </div>

                  {/* Scene Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevScene}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    <div className="flex gap-2">
                      {VIDEO_SCENES.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentSceneIdx(idx);
                            setSceneProgress(0);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            currentSceneIdx === idx 
                              ? 'w-6 bg-[#1AD1B5]' 
                              : 'w-2 bg-white/20 hover:bg-white/40'
                          }`}
                          aria-label={`Jump to scene ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextScene}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Case 4: Video Cover Card (Click to Play or Drop Video) */
              <div 
                onClick={() => {
                  if (hasNativeVideo) {
                    setIsPlaying(true);
                    videoRef.current?.play();
                  } else {
                    setIsPlaying(true);
                    playTechTone(500, 'sine', 0.2);
                  }
                }}
                className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#070C15] via-[#090F1B] to-[#04060A] cursor-pointer"
              >
                
                {/* Cybernetic glowing mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1AD1B5]/20 via-transparent to-transparent opacity-70 pointer-events-none" />
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1AD1B518_1px,transparent_1px),linear-gradient(to_bottom,#1AD1B518_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                {/* Content Overlay */}
                <div className="relative z-10 text-center flex flex-col items-center max-w-xl">
                  
                  {/* Glowing Play Button */}
                  <div className="relative group/btn mb-6">
                    <span className="absolute -inset-4 rounded-full bg-[#1AD1B5]/30 blur-lg group-hover/btn:bg-[#1AD1B5]/60 transition-all duration-300 animate-pulse" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#1AD1B5] via-[#31a2b0] to-[#855df6] flex items-center justify-center text-black shadow-2xl shadow-teal-500/40 group-hover/btn:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-black ml-1 text-black" />
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#1AD1B5] font-bold mb-2 bg-[#1AD1B5]/10 px-3.5 py-1 rounded-full border border-[#1AD1B5]/20">
                    Watch Video Presentation
                  </span>

                  <h3 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-tight font-sans">
                    Why Most AI Projects Fail — <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#855df6]">
                      & How We Fix It
                    </span>
                  </h3>

                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 max-w-md font-light">
                    Explore our diagnostic approach: We triage and streamline your workflows before automating them with AI voice dispatchers and custom software.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                    <Upload className="w-3 h-3 text-[#1AD1B5]" />
                    <span>Drop your attached MP4 file here or click Load Video</span>
                  </div>
                </div>

                {/* Corner Badges */}
                <div className="absolute top-4 left-4 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-gray-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1AD1B5]" />
                  <span>The Diagnostic DNA</span>
                </div>

                <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-gray-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#1AD1B5]" />
                  <span>HD Video Player</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Call to Action strip */}
          <div className="p-4 sm:p-6 bg-[#080C14] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#1AD1B5] shrink-0" />
              <span><strong>Philosophy:</strong> Technology must fit your business—not forcing your business to fit technology.</span>
            </div>

            {onBookCall && (
              <button
                onClick={onBookCall}
                className="w-full sm:w-auto bg-[#1AD1B5] hover:bg-[#15bda3] text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Schedule Strategy Audit</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            )}
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
