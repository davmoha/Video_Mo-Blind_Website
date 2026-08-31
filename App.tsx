/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Calendar, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  TrendingUp, 
  X, 
  Menu, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Check,
  Server,
  Layers,
  Wrench,
  ChevronDown,
  Lock,
  DollarSign,
  Users,
  Target,
  Briefcase,
  Shield,
  PieChart,
  Building,
  Award,
  Star,
  Camera,
  Upload
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import Logo from './components/Logo';
import AIChat from './components/AIChat';
import { FAQSection } from './components/FAQSection';
import { VideoSection } from './components/VideoSection';
import { sendMessageToElectrician, generateHighQualityTTS } from './services/geminiService';
import { globalAudioStreamer } from './services/audioStreamer';
import { ChatMessage, PageSection } from './types';

// Updated Solutions Portfolio Data - "Solutions are what customers buy"
const PORTFOLIO_SOLUTIONS = [
  {
    title: "Make AI Work for Your Business",
    subtitle: "AI Strategy & Process Audit",
    price: "Custom Project Scope",
    type: "Strategy",
    description: "Before recommending AI, automation, or custom software, we identify the underlying process, pain point, and business objective. Our goal is to align technology with your business goals instead of forcing your business to fit the technology.",
    deliverables: [
      "AI Readiness & Process Audit",
      "Process Bottleneck Mapping",
      "Technology Fit & SOP Roadmap",
      "Measurable Value & ROI Forecast"
    ],
    features: [
      "Solving business problems instead of just implementing technology",
      "Understanding how your business operates and where inefficiencies exist",
      "The result is technology that fits your business instead of forcing your business to fit the technology",
      "Becoming a trusted advisor who helps align technology with your actual goals"
    ]
  },
  {
    title: "Eliminate Repetitive Work",
    subtitle: "Workflow Automation",
    price: "Custom Work Scope",
    type: "Automation",
    description: "Automate customer follow-ups, data entry, notifications, scheduling, invoicing, and other repetitive tasks that consume valuable time. We build secure, background integrations using robust APIs and custom workflows.",
    deliverables: [
      "API & Webhook Integrations",
      "CRM & System Synchronization",
      "Automated Custom AI Workflows",
      "Error-Handling Frameworks"
    ],
    features: [
      "Lead routing: immediate dispatch of inbound leads to sales reps",
      "Customer onboarding: auto-provisioning portals and document flows",
      "Proposal generation: auto-create beautiful customized proposals",
      "Follow-up: automated multi-channel SMS/Email sequences"
    ]
  },
  {
    title: "Never Miss Another Opportunity",
    subtitle: "AI Voice Agents",
    price: "From $297/month",
    type: "Voice AI",
    description: "Answer every call, qualify leads, schedule appointments, and provide customer support 24/7—even when you're busy serving customers. Custom conversational voice agents that feel entirely natural.",
    deliverables: [
      "Cloned Brand Accent & Friendly Localized Phrasing",
      "Essential Plan: $497 Setup + $297/Month",
      "Growth Plan: $997 Setup + $497/Month",
      "Enterprise Plan: $1,997 Setup + $897+/Month"
    ],
    features: [
      "100% missed call recovery—instantly capture abandoned opportunities",
      "Deep integrations with Housecall Pro, ServiceTitan, and Jobber APIs",
      "Smart turn-taking logic that ignores speech overlap and background noise",
      "Outbound dispatch alerts (SMS/phone-overrides) for on-call technician squads"
    ]
  },
  {
    title: "Replace Spreadsheets & Workarounds",
    subtitle: "Custom SaaS Applications",
    price: "Custom Enterprise Build",
    type: "Custom Software",
    description: "Custom-built business software designed around your processes, helping your team work faster and more efficiently. When off-the-shelf platforms force your team to adapt, we design tools built specifically for your operations.",
    deliverables: [
      "Full-Stack Web Architectures",
      "Internal Business Dashboards",
      "CRM Replacements & Portals",
      "Durable Cloud SQL Database Design"
    ],
    features: [
      "Secure client-side and server-side logic separation (Zero API key exposure)",
      "Dynamic interactive panels, automated metrics, and scheduling blocks",
      "Highly scalable systems designed for 100% operational uptime",
      "Aligning custom technology perfectly with your unique business goals"
    ]
  },
  {
    title: "Build a Website That Works",
    subtitle: "Website Design & Optimization",
    price: "Custom Project Scope",
    type: "Websites",
    description: "Secure, professional websites that attract customers, generate leads, and integrate with your business systems. Built for modern responsiveness, extreme load speed, and built-in lead routing.",
    deliverables: [
      "AI Chat Assistant & Widget Integration",
      "Voice Caller Interactive Landing Pages",
      "Direct CRM Connection Pipelines",
      "Technical SEO Optimization Package"
    ],
    features: [
      "Responsive, desktop-first precision paired with fluid mobile layouts",
      "Lead capture automation feeding directly to automated follow-up sequences",
      "Lightning-fast page load speeds leveraging modern Vite frameworks",
      "Stunning layouts built with Tailwind CSS and micro-interactions"
    ]
  }
];

// Client platform details for Shocky Shock Electric Tampa
const ELECTRICIAN_PARAMS = {
  name: "Shocky Shock Electric",
  location: "Tampa, FL",
  hours: "Monday - Friday: Standard | Saturdays: By Appointment",
  emergency: "24/7 Standby Electrician On-Call Afterhours",
  specialties: [
    "Adding new breakers and subpanels",
    "Installing sockets, outlets, USB lines",
    "Extending power conduit to new locations",
    "Wiring hot tubs & residential spas",
    "Wiring detached garages & outbuildings",
    "Generator automatic transfer switches",
    "Installing / rewiring ceiling fans",
    "Replacing AC unit capacitors",
    "Emergency fault diagnostics"
  ]
};

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<PageSection>(PageSection.HERO);

  // Multi-Page Client Routing & Tabulation State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '' ? path : '/';
    }
    return '/';
  });
  const [viewMode, setViewMode] = useState<'tabbed' | 'full'>('tabbed');

  // Dynamic Route SEO Metadata Handler
  const updatePageSEO = (path: string) => {
    let title = "AI Automation & Voice Agent Consulting for Small Business | Mo-Blind";
    let description = "Mo-Blind helps 5-100 employee home services, healthcare, and professional firms cut missed calls with AI voice agents, automation, and custom software. From $297/mo.";
    let canonical = `https://mo-blind.com${path === '/' ? '' : path}`;

    if (path === '/ai-voice-agents') {
      title = "24/7 AI Voice Dispatchers & Phone Agents | Mo-Blind Solutions";
      description = "Never miss a customer call again. Mo-Blind 24/7 AI Voice Dispatchers answer calls, qualify leads, and schedule jobs directly into Housecall Pro, ServiceTitan, and Jobber.";
    } else if (path === '/workflow-automation') {
      title = "Custom Workflow Automation & CRM Integrations | Mo-Blind Solutions";
      description = "Streamline operations with automated lead dispatch, CRM syncing, proposal generation, and custom Make/Zapier workflows.";
    } else if (path === '/ai-strategy-audit') {
      title = "AI Strategy & 5-Phase Process Optimization Audit | Mo-Blind Solutions";
      description = "Our signature AI Business Transformation Blueprint™ audits your tech stack and standardizes SOPs before automating for guaranteed ROI.";
    } else if (path === '/custom-saas-development') {
      title = "Custom SaaS Applications & Client Portals | Mo-Blind Solutions";
      description = "Tailored web portals, job trackers, and operational SaaS tools built securely with full API integration and cloud infrastructure.";
    } else if (path === '/website-design') {
      title = "AI-Enabled Built-to-Convert Websites | Mo-Blind Solutions";
      description = "High-converting, mobile-first websites with embedded AI chat assistants, voice dispatching, and CRM lead capture.";
    } else if (path === '/faq') {
      title = "Frequently Asked Questions & GEO Knowledge Hub | Mo-Blind Solutions";
      description = "Get direct answers about Mo-Blind's AI Voice Agents, pricing ($297/mo), CRM integrations, security compliance, and onboarding.";
    } else if (path === '/about') {
      title = "About Mo-Blind Solutions — David Mohammed & Founder Story";
      description = "Learn how former Combat Medic and tech consultant David Mohammed founded Mo-Blind Solutions to bring practical AI transformation to SMBs.";
    } else if (path === '/contact' || path === '/contact-us') {
      title = "Contact Mo-Blind Solutions | Request AI Strategy Consultation";
      description = "Schedule a 1-on-1 AI transformation consultation or call (813) 704-0306 to start recovering missed call revenue.";
    } else if (path.startsWith('/industries/')) {
      const ind = path.split('/')[2] || 'home-services';
      const formatted = ind.replace(/-/g, ' ').toUpperCase();
      title = `AI Automation & Voice Agents for ${formatted} | Mo-Blind`;
      description = `Tailored AI voice dispatchers, CRM workflows, and operational software designed specifically for ${formatted} businesses.`;
    }

    if (typeof document !== 'undefined') {
      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
      const canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) canonicalEl.setAttribute('href', canonical);
    }
  };

  const getElementIdFromPath = (path: string): string => {
    const clean = path.toLowerCase().replace('#', '').trim();
    if (clean === '' || clean === '/' || clean === '/home' || clean === 'home') return 'home';
    if (clean === '/ai-voice-agents' || clean === 'ai-voice-agents' || clean === 'voice') return 'solutions';
    if (clean === '/workflow-automation' || clean === 'workflow-automation' || clean === 'automation') return 'solutions';
    if (clean === '/ai-strategy-audit' || clean === 'ai-strategy-audit' || clean === 'strategy') return 'solutions';
    if (clean === '/custom-saas-development' || clean === 'custom-saas-development' || clean === 'software') return 'solutions';
    if (clean === '/website-design' || clean === 'website-design' || clean === 'websites') return 'solutions';
    if (clean === '/faq' || clean === 'faq') return 'faq';
    if (clean === '/about' || clean === 'about' || clean === 'story') return 'story';
    if (clean === '/contact-us' || clean === 'contact-us' || clean === '/contact' || clean === 'contact' || clean === 'consultation') return 'consultation';
    if (clean.includes('industries')) return 'industries';
    if (clean === '/blueprint' || clean === 'blueprint') return 'blueprint';
    if (clean === '/security' || clean === 'security') return 'security';
    if (clean === '/roi' || clean === 'roi') return 'roi';
    if (clean === '/demo' || clean === 'demo') return 'demo';
    return clean.replace('/', '');
  };

  const getSolutionIdxFromPath = (path: string): number | undefined => {
    const clean = path.toLowerCase();
    if (clean.includes('ai-voice-agents') || clean.includes('voice')) return 2;
    if (clean.includes('workflow-automation') || clean.includes('automation')) return 1;
    if (clean.includes('ai-strategy-audit') || clean.includes('strategy')) return 0;
    if (clean.includes('custom-saas-development') || clean.includes('software')) return 3;
    if (clean.includes('website-design') || clean.includes('websites')) return 4;
    return undefined;
  };

  const navigateRoute = (path: string, solutionIdx?: number, sectionAnchor?: string) => {
    setMobileMenuOpen(false);
    
    const targetSolutionIdx = solutionIdx !== undefined ? solutionIdx : getSolutionIdxFromPath(path);
    if (targetSolutionIdx !== undefined) {
      setSelectedServiceIdx(targetSolutionIdx);
    }
    
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    updatePageSEO(path);

    const targetElementId = sectionAnchor || getElementIdFromPath(path);

    setTimeout(() => {
      if (targetElementId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 60);
  };

  // Selected Service Index state variable
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(2); // Default to Voice AI (idx 2)

  // Playground Audio Call State variables
  const [isCallActive, setIsCallActiveState] = useState(false);
  const isCallActiveRef = useRef(false);
  const setIsCallActive = (val: boolean) => {
    setIsCallActiveState(val);
    isCallActiveRef.current = val;
  };

  const [isDialing, setIsDialing] = useState(false);

  const [isListening, setIsListeningState] = useState(false);
  const isListeningRef = useRef(false);
  const setIsListening = (val: boolean) => {
    setIsListeningState(val);
    isListeningRef.current = val;
  };

  const [isSpeaking, setIsSpeakingState] = useState(false);
  const isSpeakingRef = useRef(false);
  const setIsSpeaking = (val: boolean) => {
    setIsSpeakingState(val);
    isSpeakingRef.current = val;
  };

  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [liveHeardSpeech, setLiveHeardSpeech] = useState('');

  const [isAgentReplying, setIsAgentReplyingState] = useState(false);
  const isAgentReplyingRef = useRef(false);
  const setIsAgentReplying = (val: boolean) => {
    setIsAgentReplyingState(val);
    isAgentReplyingRef.current = val;
  };

  const [isGenerationPending, setIsGenerationPendingState] = useState(false);
  const isGenerationPendingRef = useRef(false);
  const setIsGenerationPending = (val: boolean) => {
    setIsGenerationPendingState(val);
    isGenerationPendingRef.current = val;
  };

  // Calculator State variables
  const [monthlyMissedCalls, setMonthlyMissedCalls] = useState(45);
  const [averageTicketValue, setAverageTicketValue] = useState(350);
  const [captureRate, setCaptureRate] = useState(85); // % of missed calls captured by bot
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('david_profile_photo') || '/assets/david-profile.svg';
    } catch {
      return '/assets/david-profile.svg';
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProfilePhoto(result);
          setImageError(false);
          try {
            localStorage.setItem('david_profile_photo', result);
          } catch (err) {
            console.warn("Could not save to localStorage:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Synchronous ref to prevent micro-delays or overlapping mic activations when Sparky is active
  const isAgentTalkingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);

  const stopActiveAudio = () => {
    try {
      globalAudioStreamer.stop();
    } catch (e) {
      console.warn("Failed to stop active audio:", e);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (isListeningRef.current || !isCallActiveRef.current) return;
    if (isAgentTalkingRef.current || isAgentReplyingRef.current || isSpeakingRef.current) return;

    const SpeechRecObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecObj) return;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const rec = new SpeechRecObj();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = true;

      let finalSpeechText = '';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        // Discard result if Sparky has started replying or speaking
        if (isAgentTalkingRef.current || isAgentReplyingRef.current || isSpeakingRef.current) {
          return;
        }

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSpeechText += ' ' + transcriptSegment;
          } else {
            interimTranscript += ' ' + transcriptSegment;
          }
        }

        const currentFullText = (finalSpeechText + ' ' + interimTranscript).trim();
        setLiveHeardSpeech(currentFullText);

        if (currentFullText) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Trigger after 1800ms of true silence to prevent interrupting the user
          silenceTimerRef.current = setTimeout(() => {
            if (currentFullText.trim() && !isAgentTalkingRef.current && !isAgentReplyingRef.current) {
              try {
                rec.stop();
              } catch (e) {}
              setIsListening(false);
              setLiveHeardSpeech('');
              sendCallMessage(currentFullText.trim());
            }
          }, 1800);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn("Speech Recognition Notice:", e.error);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        restartTimeoutRef.current = setTimeout(() => {
          if (isCallActiveRef.current && !isAgentTalkingRef.current && !isListeningRef.current && !isAgentReplyingRef.current) {
            startListening();
          }
        }, 350);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Speech framework start paused:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setLiveHeardSpeech('');
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const playPCMBase64 = (base64: string | string[], sampleRate: number = 24000) => {
    stopActiveAudio();
    stopListening();
    isAgentTalkingRef.current = true;
    setIsSpeaking(true);

    const onEndedPlayback = () => {
      setIsSpeaking(false);
      isAgentTalkingRef.current = false;
      // 450ms cooldown prevents mic from catching speaker room echo
      setTimeout(() => {
        if (isCallActiveRef.current && !isAgentTalkingRef.current && !isAgentReplyingRef.current) {
          startListening();
        }
      }, 450);
    };

    try {
      if (Array.isArray(base64)) {
        if (base64.length === 0) {
          onEndedPlayback();
          return;
        }
        base64.forEach((chunk, idx) => {
          const isLast = idx === base64.length - 1;
          globalAudioStreamer.queueChunk(chunk, isLast ? onEndedPlayback : undefined, sampleRate);
        });
      } else {
        globalAudioStreamer.playPCM(base64, onEndedPlayback, sampleRate);
      }
    } catch (e) {
      console.error("Failed to play Gemini Web Audio stream:", e);
      onEndedPlayback();
    }
  };

  // Warmup Web Speech Voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopListening();
      stopActiveAudio();
    };
  }, []);

  // Audio timer handler
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }
  }, [isCallActive]);

  // Scroll to bottom of conversation stream inside the container ONLY (to prevent full page jumping)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcript, isAgentReplying]);

  // Format call duration MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sound generator for phone dials using Web Audio Oscillators
  const synthesizeTone = (freq1: number, freq2: number, duration: number) => {
    try {
      const audioCtx = globalAudioStreamer.getAudioContext();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gainNode.gain.setValueAtTime(0.08, now + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn("Web Audio not allowed or failed to trigger tone:", e);
    }
  };

  // Ring tone synthesis simulator
  const playDualToneRing = () => {
    synthesizeTone(440, 480, 1.2);
  };

  // Click handler for Start Voice Testing Demo
  const handleDial = async () => {
    if (isDialing || isCallActive) return;
    setIsDialing(true);
    setTranscript([]);
    
    // Warm up and prime the shared AudioContext on explicit user gesture
    try {
      globalAudioStreamer.getAudioContext();
    } catch (e) {}

    playDualToneRing();
    await new Promise(resolve => setTimeout(resolve, 1400));
    playDualToneRing();
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsDialing(false);
    setIsCallActive(true);

    const welcomeText = "Thanks for calling Shocky Shock Electric, this is Sparky! How can we power up your day today?";
    setTranscript([{ role: 'model', text: welcomeText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    
    if (voiceEnabled) {
      speakAloud(welcomeText);
    } else {
      startListening();
    }
  };

  // Hangup call
  const handleHangup = () => {
    stopListening();
    stopActiveAudio();
    isAgentTalkingRef.current = false;
    setIsCallActive(false);
    setIsSpeaking(false);
    setTranscript([]);
  };

  // Speech Synthesizer
  const speakAloud = async (text: string) => {
    stopActiveAudio();
    stopListening();
    isAgentTalkingRef.current = true;
    setIsGenerationPending(true);

    const speakableText = text.replace(/[*#_`~]/g, '');

    // 1. Try to generate high-quality, ultra-natural voice from Gemini TTS
    try {
      const base64Audio = await generateHighQualityTTS(speakableText);
      if (base64Audio) {
        setIsGenerationPending(false);
        playPCMBase64(base64Audio);
        return;
      }
    } catch (e) {
      console.warn("Could not get Gemini premium TTS stream, using standard local fallback", e);
    }

    setIsGenerationPending(false);

    // 2. Local fallback
    if (!('speechSynthesis' in window)) {
      isAgentTalkingRef.current = false;
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speakableText);
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    
    const preferredVoices = [
      'samantha',
      'google us english female',
      'zira',
      'hazel',
      'susan',
      'karen',
      'victoria',
      'tessa',
      'moira',
      'google us english',
      'natural'
    ];

    let chosenVoice = null;
    for (const name of preferredVoices) {
      chosenVoice = englishVoices.find(v => v.name.toLowerCase().includes(name));
      if (chosenVoice) break;
    }

    if (!chosenVoice) {
      chosenVoice = englishVoices.find(v => v.name.toLowerCase().includes('female')) ||
                    englishVoices.find(v => v.lang.startsWith('en-US')) ||
                    englishVoices[0] ||
                    voices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
    
    utterance.rate = 0.95; 
    utterance.pitch = 1.1; 

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      isAgentTalkingRef.current = false;
      setTimeout(() => {
        if (isCallActiveRef.current && !isAgentTalkingRef.current && !isAgentReplyingRef.current) {
          startListening();
        }
      }, 450);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isAgentTalkingRef.current = false;
      setTimeout(() => {
        if (isCallActiveRef.current && !isAgentTalkingRef.current && !isAgentReplyingRef.current) {
          startListening();
        }
      }, 450);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Browser speech recognition (Microphone to Text input fallback)
  const toggleSpeechListen = () => {
    if (isListening) {
      stopListening();
    } else {
      stopActiveAudio();
      setIsAgentReplying(false);
      setIsGenerationPending(false);
      startListening();
    }
  };

  // Direct sending routine inside active call
  const sendCallMessage = async (text: string) => {
    if (!text.trim() || isAgentReplyingRef.current) return;

    // IMMEDIATELY disable microphone listening and lock busy state synchronously
    isAgentTalkingRef.current = true;
    stopListening();
    stopActiveAudio();
    setLiveHeardSpeech('');

    // Log user message
    const userMsg: ChatMessage = { 
      role: 'user', 
      text, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setTranscript(prev => [...prev, userMsg]);
    setTextInput('');
    setIsAgentReplying(true);

    // Call Gemini Electrician Service
    const botReplyText = await sendMessageToElectrician(text);

    setTranscript(prev => [...prev, { 
      role: 'model', 
      text: botReplyText, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }]);
    
    setIsAgentReplying(false);

    if (voiceEnabled && !isMuted) {
      speakAloud(botReplyText);
    } else {
      isAgentTalkingRef.current = false;
      setTimeout(() => {
        if (isCallActiveRef.current && !isAgentTalkingRef.current && !isAgentReplyingRef.current) {
          startListening();
        }
      }, 450);
    }
  };

  // Smooth local navigation links & route router
  const scrollToSection = (id: string, solutionIdx?: number) => {
    setMobileMenuOpen(false);
    if (id === 'chatbot' || id === 'chat') {
      window.location.hash = '#chatbot';
      window.dispatchEvent(new CustomEvent('open-chatbot'));
      return;
    }

    const targetElementId = (id === 'contact-us' || id === 'contact') ? 'consultation' : (id === 'about') ? 'story' : id;

    let targetRoute = '/';
    if (id === 'voice' || (id === 'solutions' && solutionIdx === 2)) targetRoute = '/ai-voice-agents';
    else if (id === 'automation' || (id === 'solutions' && solutionIdx === 1)) targetRoute = '/workflow-automation';
    else if (id === 'strategy' || (id === 'solutions' && solutionIdx === 0)) targetRoute = '/ai-strategy-audit';
    else if (id === 'software' || (id === 'solutions' && solutionIdx === 3)) targetRoute = '/custom-saas-development';
    else if (id === 'websites' || (id === 'solutions' && solutionIdx === 4)) targetRoute = '/website-design';
    else if (id === 'faq') targetRoute = '/faq';
    else if (id === 'story' || id === 'about') targetRoute = '/about';
    else if (id === 'contact-us' || id === 'contact' || id === 'consultation') targetRoute = '/contact-us';
    else if (id === 'industries') targetRoute = '/industries/home-services';
    else if (id === 'blueprint') targetRoute = '/blueprint';
    else if (id === 'security') targetRoute = '/security';
    else if (id === 'roi') targetRoute = '/roi';

    navigateRoute(targetRoute, solutionIdx, targetElementId);
  };

  useEffect(() => {
    const handleInitialLoadAndPopState = () => {
      const hash = window.location.hash;
      if (hash === '#chatbot' || hash === '#chat') {
        window.dispatchEvent(new CustomEvent('open-chatbot'));
        return;
      }

      const path = window.location.pathname || '/';
      setCurrentPath(path);
      updatePageSEO(path);

      const targetIdx = getSolutionIdxFromPath(path);
      if (targetIdx !== undefined) {
        setSelectedServiceIdx(targetIdx);
      }

      const targetElementId = hash ? hash.replace('#', '') : getElementIdFromPath(path);
      if (targetElementId && targetElementId !== 'home') {
        setTimeout(() => {
          const actualId = (targetElementId === 'contact-us' || targetElementId === 'contact') ? 'consultation' : (targetElementId === 'about') ? 'story' : targetElementId;
          const el = document.getElementById(actualId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    };

    window.addEventListener('popstate', handleInitialLoadAndPopState);
    window.addEventListener('hashchange', handleInitialLoadAndPopState);

    handleInitialLoadAndPopState();

    return () => {
      window.removeEventListener('popstate', handleInitialLoadAndPopState);
      window.removeEventListener('hashchange', handleInitialLoadAndPopState);
    };
  }, []);

  // Calculations for dynamic ROI savings module
  const calculatedSavings = Math.round(monthlyMissedCalls * (captureRate / 100) * averageTicketValue * 12);
  const calculatedBookings = Math.round(monthlyMissedCalls * (captureRate / 100) * 12);

  return (
    <div className="relative min-h-screen text-white selection:bg-[#1AD1B5] selection:text-black cursor-default overflow-x-hidden font-sans bg-[#0A0D14]">
      <FluidBackground />
      <AIChat />

      {/* STICKY GLASS NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/10 py-2 px-4 md:px-8 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigateRoute('/')}>
          <Logo size="md" showText={true} className="w-24 h-15 scale-90 md:scale-100" />
        </div>

        {/* Desktop Menu - Direct Subpage Routes */}
        <div className="hidden lg:flex gap-3 xl:gap-5 items-center text-[11px] font-bold tracking-wider uppercase text-gray-300 font-mono">
          
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateRoute('/');
            }}
            className={`py-1 transition-colors relative cursor-pointer ${
              currentPath === '/' ? 'text-[#1AD1B5]' : 'hover:text-[#1AD1B5]'
            }`}
          >
            Overview
          </a>

          {/* SOLUTIONS DROPDOWN WITH REAL ROUTES */}
          <div className="relative group py-2">
            <button className="hover:text-[#1AD1B5] transition-all flex items-center gap-1 focus:outline-none cursor-pointer">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* Dropdown Box */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 rounded-2xl bg-[#0D1321] border border-white/10 p-2 shadow-2xl hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {[
                { label: 'AI Voice Agents', path: '/ai-voice-agents', idx: 2 },
                { label: 'Workflow Automation', path: '/workflow-automation', idx: 1 },
                { label: 'AI Strategy & Audit', path: '/ai-strategy-audit', idx: 0 },
                { label: 'Custom Software', path: '/custom-saas-development', idx: 3 },
                { label: 'Websites & Apps', path: '/website-design', idx: 4 },
              ].map((item, index) => (
                <a
                  key={`${item.label}-${index}`}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateRoute(item.path, item.idx);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold transition-all duration-200 cursor-pointer block uppercase tracking-wider ${
                    currentPath === item.path
                      ? 'bg-[#1AD1B5] text-black'
                      : 'text-gray-300 hover:text-black hover:bg-[#1AD1B5]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {[
            { label: 'FAQ Hub', path: '/faq' },
            { label: 'Industries', path: '/industries/home-services' },
            { label: 'About', path: '/about' },
            { label: 'Contact Us', path: '/contact-us' }
          ].map((item, index) => (
            <a 
              key={`${item.label}-${index}`} 
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigateRoute(item.path);
              }}
              className={`transition-colors relative py-1 group focus:outline-none cursor-pointer whitespace-nowrap ${
                currentPath === item.path ? 'text-[#1AD1B5]' : 'hover:text-[#1AD1B5]'
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#1AD1B5] transition-transform origin-left duration-250 ${
                currentPath === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </a>
          ))}

          {/* View Mode Switcher Toggle */}
          <div className="ml-2 pl-2 border-l border-white/10 flex items-center gap-1 bg-[#111728] p-1 rounded-xl border">
            <button
              onClick={() => setViewMode('tabbed')}
              className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold tracking-tight uppercase cursor-pointer transition-all ${
                viewMode === 'tabbed' ? 'bg-[#1AD1B5] text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="View pages as distinct, focused URL tabs"
            >
              Tabs
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold tracking-tight uppercase cursor-pointer transition-all ${
                viewMode === 'full' ? 'bg-[#1AD1B5] text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="View full unified scrolling workspace"
            >
              Full
            </button>
          </div>

        </div>

        {/* Contact info and CTA button matching Image 2 */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          <a 
            href="tel:8137040306" 
            className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-[#1AD1B5] transition-colors whitespace-nowrap font-mono"
          >
            <Phone className="w-3.5 h-3.5 text-[#1AD1B5] fill-[#1AD1B5]/10" />
            <span>(813) 704-0306</span>
          </a>

          <div className="h-4 w-px bg-white/10" />

          <a 
            href="/contact-us"
            onClick={(e) => {
              e.preventDefault();
              navigateRoute('/contact-us');
            }}
            className="bg-[#1AD1B5] hover:bg-[#15bda3] text-black font-extrabold px-4 xl:px-5 py-2 rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center opacity-80 hover:opacity-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
           {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* SUB-HEADER PAGE NAVIGATION BAR FOR QUICK TABBING */}
      <div className="pt-20 bg-[#070a13] border-b border-white/5 px-4 py-2.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap">
          <span className="text-gray-500 shrink-0 text-[10px] mr-1">PAGE DIRECTORY:</span>
          {[
            { label: 'Overview', path: '/' },
            { label: 'Voice AI Agents', path: '/ai-voice-agents' },
            { label: 'Workflow Automation', path: '/workflow-automation' },
            { label: 'AI Strategy Audit', path: '/ai-strategy-audit' },
            { label: 'Custom SaaS Apps', path: '/custom-saas-development' },
            { label: 'Websites', path: '/website-design' },
            { label: 'FAQ Hub (GEO)', path: '/faq' },
            { label: 'About & Story', path: '/about' },
            { label: 'Contact Us', path: '/contact-us' },
          ].map((tab) => (
            <a
              key={tab.path}
              href={tab.path}
              onClick={(e) => {
                e.preventDefault();
                navigateRoute(tab.path);
              }}
              className={`px-3 py-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                currentPath === tab.path
                  ? 'bg-[#1AD1B5]/15 border-[#1AD1B5] text-[#1AD1B5]'
                  : 'bg-[#0d121f] border-white/5 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0A0D14]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-2.5 lg:hidden p-6 overflow-y-auto"
          >
            {/* Solutions Subheader for Mobile */}
            <span className="text-[10px] font-mono tracking-widest text-[#1AD1B5] uppercase font-bold mt-4">Solutions</span>
            <div className="flex flex-col items-center gap-1.5 border-b border-white/5 pb-4 w-full max-w-xs">
              {[
                { label: 'AI Strategy', id: 'solutions', idx: 0 },
                { label: 'Automation', id: 'solutions', idx: 1 },
                { label: 'Voice AI', id: 'solutions', idx: 2 },
                { label: 'Custom Software', id: 'solutions', idx: 3 },
                { label: 'Websites', id: 'solutions', idx: 4 },
              ].map((item, index) => (
                <a
                  key={`m-${item.label}-${index}`}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id, item.idx);
                  }}
                  className="text-sm font-bold text-gray-300 hover:text-[#1AD1B5] transition-colors uppercase bg-transparent border-none cursor-pointer tracking-wide"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Other main links for mobile */}
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-bold mt-2">Navigation</span>
            {[
              { label: 'Industries', id: 'industries' },
              { label: 'Blueprint', id: 'blueprint' },
              { label: 'Security', id: 'security' },
              { label: 'ROI Lift', id: 'roi' },
              { label: 'Story', id: 'story' },
              { label: 'Chat Bot', id: 'chatbot' },
              { label: 'Contact Us', id: 'contact-us' }
            ].map((item, index) => (
              <a
                key={`m-main-${item.label}-${index}`}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className="text-base font-black text-white hover:text-[#1AD1B5] transition-colors uppercase bg-transparent border-none cursor-pointer tracking-wider"
              >
                {item.label}
              </a>
            ))}
            
            <a 
              href="tel:8137040306" 
              className="flex items-center gap-2 text-md font-bold text-gray-300 hover:text-[#1AD1B5] transition-colors mt-2"
            >
              <Phone className="w-4 h-4 text-[#1AD1B5]" />
              <span>(813) 704-0306</span>
            </a>

            <a 
              href="#contact-us"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact-us');
              }}
              className="mt-4 bg-[#1AD1B5] hover:bg-[#15bda3] text-black rounded-xl px-8 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-teal-500/20 text-center block"
            >
              Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO HERO SECTION */}
      <header id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24 md:pt-28">
        <div className="z-10 text-center flex flex-col items-center w-full max-w-5xl py-12 md:py-20">
          
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-xs md:text-sm font-mono text-[#1AD1B5] tracking-[0.2em] uppercase mb-6 bg-[#1AD1B5]/5 py-2 px-5 rounded-full border border-[#1AD1B5]/20 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1AD1B5]" />
            <span>AI Transformation & Process Optimization</span>
          </motion.div>

          {/* Large display headings matching Advisor Recommendation */}
          <div className="relative w-full flex justify-center items-center flex-col my-2">
            <h1 className="text-[10vw] sm:text-[6vw] md:text-[5vw] leading-[1.05] font-extrabold tracking-tight text-center uppercase max-w-5xl text-white font-sans">
              AI Solutions That <br className="hidden md:inline" />
              Simplify Your Business — <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] via-[#31a2b0] to-[#855df6] italic pr-2 font-serif font-black">Not Add Complexity</span>
            </h1>
            
            {/* Ambient Orb */}
            <motion.div 
               className="absolute -z-20 w-[60vw] h-[60vw] bg-[#1AD1B5]/10 blur-[90px] rounded-full pointer-events-none will-change-transform"
               animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.25, 0.4, 0.25] }}
               transition={{ duration: 8, repeat: Infinity }}
               style={{ transform: 'translateZ(0)' }}
             />
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-sm md:text-lg font-light tracking-wide max-w-3xl mx-auto text-gray-300 leading-relaxed px-4 text-center mt-6"
          >
            We help business owners save time, reduce manual work, recover lost revenue, and streamline operations through AI, automation, and custom business solutions.
          </motion.p>

          {/* "We don't sell AI. We sell results." Callout pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 mb-2 bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-2xl px-6 py-2.5 max-w-md"
          >
            <span className="text-sm md:text-base font-extrabold text-[#1AD1B5] tracking-wider uppercase font-mono">
              "We don't sell AI. We sell results."
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12 w-full max-w-lg px-4 justify-center"
          >
            <button 
              onClick={() => scrollToSection('consultation')}
              className="flex-1 bg-[#1AD1B5] hover:bg-[#15bda3] text-black font-extrabold py-4 px-6 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              data-hover="true"
            >
              <span>Schedule a Discovery Call</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/30 text-white font-extrabold py-4 px-6 rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              data-hover="true"
            >
              <span>Test Voice Assistant</span>
              <Phone className="w-4 h-4 text-[#1AD1B5]" />
            </button>
          </motion.div>
        </div>

        {/* Floating Arrow Scroller */}
        <div className="absolute bottom-6 flex flex-col items-center justify-center shrink-0 cursor-pointer text-white/40 hover:text-white transition-colors" onClick={() => scrollToSection('philosophy')}>
          <span className="text-[10px] font-mono uppercase tracking-widest mb-1.5">Our Philosophy</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </header>

      {/* ELEGANT INTRO METRIC STATS BANNER */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 border-y border-white/5 bg-[#0D1321]/40 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { stat: "24/7/365", label: "Availability", sub: "Never miss an emergency diagnostic" },
          { stat: "< 2 Secs", label: "Latency Phrasing", sub: "Feels like speaking to a real technician" },
          { stat: "100%", label: "CRM Booking", sub: "Syncs leads directly to Housecall Pro" }
        ].map((item, idx) => (
          <div key={idx} className="text-center flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-black font-heading tracking-tight text-[#1AD1B5]">{item.stat}</span>
            <span className="text-sm font-bold tracking-wider uppercase text-white mt-1.5">{item.label}</span>
            <span className="text-xs text-gray-400 mt-1">{item.sub}</span>
          </div>
        ))}
      </section>

      {/* BRAND PHILOSOPHY: WE DIAGNOSE BEFORE WE PRESCRIBE */}
      <section id="philosophy" className="relative z-10 py-20 md:py-32 max-w-7xl mx-auto px-6 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column representing Sinek Callout */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#051C1E] to-[#01090A] border-2 border-[#1AD1B5]/30 rounded-[36px] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1AD1B5]/10 rounded-full filter blur-xl pointer-events-none" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#1AD1B5] font-bold border border-[#1AD1B5]/30 rounded-full px-4 py-1.5 bg-[#1AD1B5]/5 mb-6 inline-block">
              Our Core Philosophy
            </span>
            <blockquote className="text-xl md:text-2xl font-semibold text-white leading-relaxed font-sans uppercase tracking-tight">
              "The result is technology that fits your business instead of forcing your business to fit the technology."
            </blockquote>
            <div className="h-0.5 w-16 bg-gradient-to-r from-[#1AD1B5] to-[#805af5] my-6" />
            <p className="text-xs font-mono text-[#1AD1B5] uppercase tracking-widest font-bold">
              — We Diagnose Before We Prescribe
            </p>
          </div>

          {/* Right Column details */}
          <div className="lg:col-span-6 space-y-6 lg:pl-6">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] font-extrabold block">
              Why We Exist
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-black text-white uppercase leading-tight">
              We Believe Business Owners Deserve Solutions—<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5]">Not More Complexity</span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
              Unlike firms that lead with technology, we begin by understanding your business, your processes, and your goals. We don’t sell AI for the sake of AI.
            </p>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-light">
              Before recommending AI, automation, or custom software, we take the time to understand how your business operates, where inefficiencies exist, and what outcomes matter most to you. Because you can't out-automate a bad process.
            </p>
            <div className="pt-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-[#1AD1B5] bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-2 inline-block uppercase tracking-wider">
                Sometimes that's AI. Sometimes it's automation. Sometimes it's a simple process fix.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 60-SECOND PHILOSOPHY VIDEO SECTION */}
      <VideoSection 
        youtubeVideoId="https://youtu.be/DRgf5DnR3w0?si=mTlYbXzerDQbAmSI"
        onBookCall={() => scrollToSection('consultation')} 
      />

      {/* HOW WE'RE DIFFERENT: THE DIAGNOSTIC DNA */}
      <section id="difference" className="relative z-10 py-20 md:py-32 bg-[#0A0D14]/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block">
              Why Our Methodology Works
            </span>
            <h2 className="text-3xl md:text-6xl font-sans font-black text-white uppercase mt-4">
              How We're Different
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-3 leading-relaxed font-light">
              Our systematic approach is built on a career of solving complex problems in high-stakes environments. We don't guess—we diagnose.
            </p>
          </div>

          {/* Diagnostic DNA Journey Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Chemistry",
                subtitle: "The Analytical Mindset",
                icon: <Cpu className="w-5 h-5 text-[#1AD1B5]" />,
                desc: "My background in Chemistry taught me to systematically observe reactions, isolate variables, analyze structures, and design repeatable formulas. It laid the foundation for how I isolate complex business problems today.",
                color: "border-[#1AD1B5]/20"
              },
              {
                title: "Combat Medic",
                subtitle: "Triage & Diagnosis",
                icon: <ShieldCheck className="w-5 h-5 text-[#1AD1B5]" />,
                desc: "In the U.S. Army, clarity was a matter of life and death. I was trained to observe, assess, prioritize, diagnose, and treat under extreme stress. When your business operations are chaotic, I bring order and calm.",
                color: "border-teal-500/20"
              },
              {
                title: "Math Teacher",
                subtitle: "Simplifying Complexity",
                icon: <Layers className="w-5 h-5 text-purple-400" />,
                desc: "Teaching middle school math requires taking complex, abstract concepts and breaking them down into fundamental, bite-sized building blocks so that everyone can master the mechanics before building scale.",
                color: "border-purple-500/20"
              },
              {
                title: "22 Years at AT&T",
                subtitle: "Enterprise Diagnostics",
                icon: <Server className="w-5 h-5 text-indigo-400" />,
                desc: "Over more than two decades, I diagnosed complex IP sessions, firewalls, and security infrastructure. I managed thousands of multimillion-dollar projects with executives, ensuring technology served human processes.",
                color: "border-indigo-500/20"
              }
            ].map((card, i) => (
              <div 
                key={i}
                className={`p-6 rounded-3xl bg-[#0D1321]/60 border ${card.color} hover:border-white/20 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-0.5">Pillar 0{i + 1}</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-sans">{card.title}</h3>
                  <p className="text-xs text-[#1AD1B5] font-mono uppercase mt-0.5 mb-3">{card.subtitle}</p>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE SOLVE */}
      <section className="relative z-10 py-20 md:py-32 bg-[#080B12]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block">
                Identify Your Leaks
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-black text-white uppercase leading-tight">
                What We Solve — <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5]">Demonstrated Results</span>
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
                We focus on solving business problems. If your business is experiencing any of these operational pain points, we design targeted solutions to eliminate them entirely.
              </p>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-400 leading-relaxed font-light font-sans">
                  "Most consultants focus on implementing technology. We focus on solving business problems so that your systems scale seamlessly with your growth."
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Missed customer calls", desc: "Instantly capture every opportunity 24/7." },
                  { title: "Repetitive manual work", desc: "Eliminate hours of double-entry data errors." },
                  { title: "Disconnected systems", desc: "Securely bridge and sync your core platform APIs." },
                  { title: "Inefficient processes", desc: "Streamline and document Standard Operating Procedures." },
                  { title: "Lost leads", desc: "Automate speed-to-lead routing within seconds." },
                  { title: "Poor customer follow-up", desc: "Keep prospects warm with natural follow-up loops." },
                  { title: "Spreadsheet chaos", desc: "Consolidate disarray into clean cloud database apps." },
                  { title: "Lack of visibility into operations", desc: "Track exact status with dynamic metrics." },
                  { title: "Technology that doesn't scale", desc: "Deploy resilient cloud structures built for growth." }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-[#0D1321]/40 border border-white/5 hover:border-[#1AD1B5]/20 transition-all flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1AD1B5]/10 border border-[#1AD1B5]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#1AD1B5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE VOICE PLAYGROUND (SHOCKY SHOCK ELECTRIC SIMULATOR) */}
      <section id="demo" className="relative z-10 py-20 md:py-32 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-7xl font-sans font-extrabold uppercase leading-none text-white tracking-tight">
              Live Phone <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5] italic font-serif">Playground</span>
            </h2>
            <p className="text-xs md:text-sm text-[#1AD1B5] font-mono tracking-widest mt-3 uppercase font-bold">
              Demonstrating CRM-Cloned Integration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Box: Client Scenario Parameters */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 bg-[#0D1321]/80 backdrop-blur-md rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col justify-between glow-border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#1AD1B5]/10 to-transparent pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1AD1B5] animate-pulse" />
                  <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest">Active Demo Scenario</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-heading font-black text-white leading-tight uppercase mb-1">
                  {ELECTRICIAN_PARAMS.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono mb-6">
                  <MapPin className="w-3.5 h-3.5 text-[#1AD1B5]" />
                  <span>Located in {ELECTRICIAN_PARAMS.location}</span>
                </div>

                <div className="space-y-4 text-xs md:text-sm text-gray-300 mb-8 border-t border-white/5 pt-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-xs">Standard Booking Hours</h4>
                      <p className="text-gray-400">{ELECTRICIAN_PARAMS.hours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-xs">Afterhours Standby Dispatch</h4>
                      <p className="text-gray-400">{ELECTRICIAN_PARAMS.emergency}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-heading font-bold text-white uppercase text-xs tracking-wider mb-3">Specialty Knowledge Scope</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 font-medium">
                    {ELECTRICIAN_PARAMS.specialties.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2 leading-tight">
                        <Check className="w-3.5 h-3.5 text-[#1AD1B5] shrink-0" />
                        <span className="text-gray-400 text-[11px]">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 mt-6">
                <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                  💡 <b className="text-[#1AD1B5]">Try Testing Sparky:</b> Ask about booking wiring for a new detached garage, check availability for AC capacitor replacement, request a hot tub subpanel, or test how he routes an on-call tech after hours!
                </p>
              </div>
            </motion.div>

            {/* Right Box: Floating Interactive Phone Sandbox */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-xl bg-[#090D14]/90 backdrop-blur-xl border border-[#1AD1B5]/20 rounded-[32px] overflow-hidden shadow-2xl shadow-[#1AD1B5]/5 relative flex flex-col h-[560px]">
                
                {/* Phone Header panel */}
                <div className="bg-slate-950/50 p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#855df6] to-[#1AD1B5] flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">MO-Blind Demo Link</span>
                  </div>
                  
                  {isCallActive && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-mono tracking-wider font-bold text-red-400">{formatTime(callDuration)}</span>
                    </div>
                  )}
                </div>

                {/* Main Inside Phone Module Panel */}
                <div className="flex-1 overflow-hidden p-6 relative flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    {!isCallActive && !isDialing ? (
                      
                      /* IDLE DIAL SCREEN */
                      <motion.div 
                        key="idle-screen"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-4"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner relative group cursor-pointer" onClick={handleDial}>
                          <div className="absolute inset-2 rounded-full bg-[#1AD1B5]/10 opacity-40 group-hover:scale-125 transition-transform duration-500" />
                          <Phone className="w-8 h-8 text-[#1AD1B5] group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <h4 className="text-xl font-bold font-sans uppercase text-white mb-2 leading-none">Sparky is Ready</h4>
                        <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                          Test Sparky's voice answering, troubleshooting questions, and dispatch routines live. Connect your feed instantly below.
                        </p>

                        <div className="space-y-4">
                          <button 
                            onClick={handleDial}
                            className="bg-gradient-to-r from-[#1AD1B5] via-[#2ba8b5] to-[#855df6] text-black font-extrabold uppercase text-xs tracking-wider py-4 px-8 rounded-xl hover:brightness-110 shadow-lg shadow-teal-500/10 cursor-pointer text-center flex items-center gap-2 justify-center"
                            data-hover="true"
                          >
                            <Phone className="w-4 h-4 fill-black" />
                            <span>Place Demo Call</span>
                          </button>

                          <label className="flex items-center justify-center gap-2.5 text-xs text-gray-400 cursor-pointer mb-2">
                            <input 
                              type="checkbox" 
                              checked={voiceEnabled}
                              onChange={(e) => setVoiceEnabled(e.target.checked)}
                              className="rounded accent-[#1AD1B5] border-white/10 w-4 h-4"
                            />
                            <span>Voice Reader Enabled (Hear Sparky Speak)</span>
                          </label>
                        </div>
                      </motion.div>

                    ) : isDialing ? (
                      
                      /* DIALING SCREEN */
                      <motion.div 
                        key="dialing-screen"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="flex-1 flex flex-col items-center justify-center text-center"
                      >
                        <div className="w-20 h-20 rounded-full bg-[#1AD1B5]/10 border border-[#1AD1B5]/40 flex items-center justify-center mb-6 animate-pulse">
                          <Phone className="w-8 h-8 text-[#1AD1B5] animate-bounce" />
                        </div>
                        <h4 className="text-lg font-bold font-mono uppercase text-[#1AD1B5] tracking-widest mb-1.5 animate-pulse">Dialing...</h4>
                        <p className="text-xs text-gray-400 font-mono">Connecting secure playground line...</p>
                      </motion.div>

                    ) : (
                      
                      /* ACTIVE CALL SCREEN */
                      <motion.div 
                        key="active-screen"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className="flex-1 flex flex-col justify-between h-full relative overflow-hidden"
                      >
                        
                        {/* Live Call Pulsing waveform when speaker is active */}
                        <div className="h-28 flex flex-col items-center justify-center border-b border-white/5 pb-2 relative">
                          <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-xs">
                            {[
                              { delay: "0.1s", h: "12" },
                              { delay: "0.2s", h: "32" },
                              { delay: "0.4s", h: "16" },
                              { delay: "0s",   h: "48" },
                              { delay: "0.3s", h: "20" },
                              { delay: "0.5s", h: "36" },
                              { delay: "0.1s", h: "16" },
                              { delay: "0s",   h: "48" },
                              { delay: "0.2s", h: "12" },
                              { delay: "0.4s", h: "28" },
                              { delay: "0.1s", h: "16" },
                              { delay: "0.3s", h: "8" },
                            ].map((bar, i) => (
                              <motion.span 
                                key={i}
                                className={`w-1 rounded-full bg-gradient-to-t ${isSpeaking ? 'from-[#1AD1B5] to-[#855df6]' : 'from-gray-700 to-gray-600'}`}
                                animate={{ 
                                  scaleY: isSpeaking ? [0.2, 1, 0.2] : isListening ? Math.sin(i) * 0.4 + 0.3 : 0.2 
                                }}
                                transition={{ 
                                  duration: 0.8, 
                                  repeat: Infinity, 
                                  repeatType: "reverse", 
                                  delay: i * 0.05 
                                }}
                                style={{ 
                                  height: `${bar.h}px`, 
                                  transformOrigin: "bottom",
                                  opacity: isSpeaking || isListening ? 1 : 0.4
                                }}
                              />
                            ))}
                          </div>
                          
                          <div className="text-[10px] font-mono tracking-wider font-semibold text-gray-400 uppercase mt-4">
                            {isSpeaking ? "SPARKY speaking aloud" : isListening ? "SPEECH CAPTURE ON..." : "Awaiting your voice response..."}
                          </div>
                        </div>

                        {/* Transcripts module box */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto my-2 p-2 space-y-3 max-h-48 rounded-xl scroll-smooth">
                          {transcript.map((msg, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ 
                                opacity: 0, 
                                y: 10, 
                                scale: 0.96,
                                x: msg.role === 'user' ? 8 : -8 
                              }}
                              animate={{ 
                                opacity: 1, 
                                y: 0, 
                                scale: 1,
                                x: 0 
                              }}
                              transition={{ 
                                duration: 0.28, 
                                ease: [0.22, 1, 0.36, 1] 
                              }}
                              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[9px] font-mono text-gray-500 mb-0.5 px-2">{msg.role === 'user' ? 'Caller' : 'Sparky'} • {msg.time}</span>
                              <div
                                className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                                  msg.role === 'user'
                                    ? 'bg-[#1AD1B5] text-black rounded-tr-none font-medium text-right'
                                    : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </motion.div>
                          ))}

                          {/* Real-time live speech feedback bubble */}
                          {liveHeardSpeech && (
                            <motion.div 
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="flex items-end flex-col animate-pulse"
                            >
                              <span className="text-[9px] font-mono text-[#1AD1B5] mb-0.5 px-2 flex items-center gap-1">
                                <Mic className="w-2.5 h-2.5 animate-spin" /> Hearing you speak...
                              </span>
                              <div className="max-w-[90%] p-2.5 rounded-2xl rounded-tr-none bg-[#1AD1B5]/20 border border-[#1AD1B5]/40 text-white text-[12px] flex items-center gap-2">
                                <span className="italic">"{liveHeardSpeech}"</span>
                                <button
                                  onClick={() => {
                                    const txt = liveHeardSpeech;
                                    stopListening();
                                    sendCallMessage(txt);
                                  }}
                                  className="bg-[#1AD1B5] hover:bg-[#15bda3] text-black font-extrabold text-[10px] uppercase px-2 py-1 rounded-lg shrink-0 cursor-pointer"
                                >
                                  Send
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {isAgentReplying && (
                            <motion.div 
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="flex items-start flex-col"
                            >
                              <span className="text-[9px] font-mono text-gray-400 mb-0.5 px-2 flex items-center gap-1">
                                <Cpu className="w-2.5 h-2.5 text-[#1AD1B5] animate-spin" /> Sparky thinking...
                              </span>
                              <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                                <span className="w-2 h-2 bg-[#1AD1B5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-[#1AD1B5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-[#1AD1B5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </motion.div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Quick Scenario Prompt Chips */}
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 text-[10px] font-mono">
                          {[
                            "Need a 200A subpanel quote",
                            "Tripped breaker emergency",
                            "EV charger installation"
                          ].map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => sendCallMessage(prompt)}
                              disabled={isAgentReplying || isSpeaking}
                              className="bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer disabled:opacity-30 shrink-0"
                            >
                              + {prompt}
                            </button>
                          ))}
                        </div>

                        {/* Caller Audio Interface controls */}
                        <div className="border-t border-white/5 pt-3">
                          <div className="flex gap-2">
                            
                            {/* Microphone Voice toggler */}
                            <button
                              onClick={toggleSpeechListen}
                              className={`p-3 rounded-2xl border transition-all duration-300 relative group flex items-center justify-center shrink-0
                                ${isListening 
                                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                                  : 'bg-white/5 text-[#1AD1B5] border-white/10 hover:bg-white/10'
                                }`}
                              title="Speak with microphone"
                              data-hover="true"
                            >
                              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>

                            {/* Text dispatcher standard typed keyboard fallback option */}
                            <div className="flex-1 relative flex items-center">
                              <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    sendCallMessage(textInput);
                                  }
                                }}
                                placeholder={isListening ? "Listening... Speak now..." : "Speak or type your message..."}
                                disabled={isAgentReplying}
                                className="w-full bg-white/5 text-white text-xs placeholder-white/30 rounded-2xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#1AD1B5]/50 transition-colors pr-10"
                              />
                              {textInput.trim() && (
                                <button
                                  onClick={() => sendCallMessage(textInput)}
                                  className="absolute right-3 p-1 rounded-lg text-[#1AD1B5] hover:text-white transition-colors cursor-pointer"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              )}
                            </div>

                            {/* Voice Speak toggle reader */}
                            <button
                              onClick={() => setIsMuted(!isMuted)}
                              className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center shrink-0
                                ${isMuted
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-white/5 text-[#1AD1B5] border-white/10 hover:bg-white/10'
                                }`}
                              title={isMuted ? "Unmute Bot Voice" : "Mute Bot Voice"}
                              data-hover="true"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            {/* Hangup Trigger */}
                            <button
                              onClick={handleHangup}
                              className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-2xl transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer shadow-lg shadow-red-500/20"
                              title="Disconnect demo line"
                              data-hover="true"
                            >
                              <PhoneOff className="w-4 h-4" />
                            </button>

                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulated Phone Bar bottom */}
                <div className="bg-slate-950 px-4 py-3 border-t border-white/5 text-center text-[10px] font-mono text-gray-500">
                  Secure Demo Frame Channel • Dialing Tampa local node
                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* BRAND PHILOSOPHY & SOLUTIONS HUB SECTION */}
      <section id="solutions-philosophy" className="relative z-10 py-20 md:py-32 bg-[#0A0D14]/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Brand Philosophy Block - "We Start With Understanding Your Business" */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
            <div className="lg:col-span-6">
              <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block">
                Our Core Philosophy
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-black uppercase text-white leading-tight mt-4">
                We Don't Start With Technology.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] via-[#2fae9c] to-[#855df6] italic font-serif font-black pr-2">We Start With Your Business.</span>
              </h2>
              <p className="text-sm md:text-base text-gray-300 font-light mt-5 leading-relaxed max-w-xl">
                Most consultants focus on implementing technology. <b>We focus on solving business problems.</b> Before recommending AI, automation, or custom software, we take the time to understand how your business operates, where inefficiencies exist, and what outcomes matter most to you.
              </p>
              <div className="mt-6 border-l-2 border-[#1AD1B5] pl-4 italic text-xs md:text-sm text-[#1AD1B5]/90 font-light">
                "The result is technology that fits your business instead of forcing your business to fit the technology."
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#0D1321]/60 border border-white/5">
                <h4 className="text-xs font-mono text-[#1AD1B5] uppercase tracking-widest font-bold mb-2">SOLUTIONS VS. SERVICES</h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Services are what you sell. Solutions are what customers buy. Our goal is to align technology with your goals, not be an AI vending machine.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D1321]/60 border border-white/5">
                <h4 className="text-xs font-mono text-[#805af5] uppercase tracking-widest font-bold mb-2">CLARITY VS. COMPLEXITY</h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  We believe business owners deserve solutions—not more complexity. We recommend practical, high-value outcomes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D1321]/60 border border-white/5 sm:col-span-2">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold mb-2">A TRUSTED ADVISOR</h4>
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  We don't simply deliver a solution and walk away. We become a trusted advisor who helps you make better decisions. Sometimes that's AI. Sometimes it's automation. Sometimes it's custom software. Sometimes it's simply a better process.
                </p>
              </div>
            </div>
          </div>

          <div id="solutions" className="border-t border-white/5 pt-16 max-w-3xl mb-16">
            <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block">
              Business-First Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl font-sans font-extrabold uppercase text-white leading-tight mt-4">
              Our Tailored <span className="text-[#1AD1B5] italic font-serif">Solutions</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-light mt-2 leading-relaxed">
              Explore how we translate high-impact technology into customized business results.
            </p>
          </div>

          {/* Interactive Solutions Tab Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Vertical Tab Selectors */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-mono uppercase text-gray-500 tracking-widest font-bold mb-4 px-2">SELECT A SOLUTION</h3>
              {PORTFOLIO_SOLUTIONS.map((srv, idx) => {
                const isActive = selectedServiceIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedServiceIdx(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#0E1D21] to-[#0A101C] border-[#1AD1B5]/40 shadow-lg shadow-teal-500/5' 
                        : 'bg-[#0D1321]/40 border-white/5 hover:border-white/10 hover:bg-[#0D1321]/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                        isActive ? 'bg-[#1AD1B5] text-black' : 'bg-white/5 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className={`text-xs font-mono uppercase tracking-wide transition-colors ${
                          isActive ? 'text-[#1AD1B5]' : 'text-gray-400'
                        }`}>{srv.subtitle}</h4>
                        <p className={`text-sm font-bold uppercase font-sans mt-0.5 tracking-wide transition-colors ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}>{srv.title}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? 'text-[#1AD1B5] translate-x-1' : 'text-gray-600'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Animated Selected Service Display */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedServiceIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0D1321]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8 md:p-10 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1AD1B5]/5 rounded-full filter blur-xl pointer-events-none" />
                  
                  {/* Service Card Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#1AD1B5] uppercase font-bold bg-[#1AD1B5]/10 border border-[#1AD1B5]/20 rounded px-2.5 py-1">
                        Solution {selectedServiceIdx + 1} • {PORTFOLIO_SOLUTIONS[selectedServiceIdx].type}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-extrabold uppercase text-white tracking-wide mt-3 leading-tight">
                        {PORTFOLIO_SOLUTIONS[selectedServiceIdx].title}
                      </h3>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mt-1">{PORTFOLIO_SOLUTIONS[selectedServiceIdx].subtitle}</p>
                    </div>
                    <div className="bg-[#1AD1B5]/5 border border-[#1AD1B5]/30 rounded-2xl p-4 text-center sm:text-right shrink-0">
                      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Typical Pricing</p>
                      <p className="text-lg md:text-xl font-black text-[#1AD1B5] tracking-tight mt-1">
                        {PORTFOLIO_SOLUTIONS[selectedServiceIdx].price}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="py-6">
                    <p className="text-sm text-gray-200 leading-relaxed font-light">
                      {PORTFOLIO_SOLUTIONS[selectedServiceIdx].description}
                    </p>
                  </div>

                  {/* Deliverables Checklist Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                    <div>
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#1AD1B5]" />
                        Key Deliverables
                      </h4>
                      <ul className="space-y-2">
                        {PORTFOLIO_SOLUTIONS[selectedServiceIdx].deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-300 font-medium">
                            <Check className="w-4 h-4 text-[#1AD1B5] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-[#1AD1B5]" />
                        Features & Focus
                      </h4>
                      <ul className="space-y-2">
                        {PORTFOLIO_SOLUTIONS[selectedServiceIdx].features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed font-light">
                            <span className="w-1.5 h-1.5 bg-[#1AD1B5]/60 rounded-full shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Floating Contact Trigger inside details */}
                  <div className="mt-8 border-t border-white/5 pt-6 flex justify-end">
                    <button
                      onClick={() => scrollToSection('consultation')}
                      className="bg-white/5 border border-white/10 hover:border-white/30 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>Inquire About This Solution</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1AD1B5]" />
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* PRIMARY MARKET & INDUSTRIES WE SERVE */}
          <div id="industries" className="mt-24 border-t border-white/5 pt-16">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest">Updated Ideal Customer</span>
              <h3 className="text-3xl font-extrabold uppercase text-white mt-2">Target Industries</h3>
              <p className="text-xs md:text-sm text-gray-400 font-light mt-2 leading-relaxed">
                We custom-tailor setups for small to mid-sized businesses (<b>5 to 100 employees</b>) across critical high-overhead industry sectors.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { name: "Home Services", desc: "Plumbing, HVAC, Electrical" },
                { name: "Healthcare", desc: "Clinics, Dental, Therapists" },
                { name: "Professional Services", desc: "Consultancies, Agencies" },
                { name: "Legal", desc: "Law Firms, Notaries" },
                { name: "Accounting", desc: "CPAs, Financial Planners" },
                { name: "Real Estate", desc: "Brokerages, Valuations" },
                { name: "Construction", desc: "Contractors, Developers" },
                { name: "Nonprofits", desc: "Charities, Associations" },
                { name: "Manufacturing", desc: "Factories, Tooling Plants" },
                { name: "Logistics", desc: "Hauling, Fleet Operators" }
              ].map((ind, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl bg-[#0D1321]/40 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#1AD1B5]" />
                    <span className="text-xs font-bold text-white font-sans uppercase tracking-wide">{ind.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FLAGSHIP PROCESS SECTION: AI BUSINESS TRANSFORMATION BLUEPRINT */}
      <section id="blueprint" className="relative z-10 py-20 md:py-32 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7">
              <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block">
                Our Signature Framework
              </span>
              <h2 className="text-4xl md:text-6xl font-sans font-black text-white uppercase leading-tight mt-4">
                AI Business Transformation <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5] italic font-serif">Blueprint™</span>
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light mt-4">
                We don't launch untested models. Our signature 5-phase delivery blueprint ensures we restructure your manual SOPs and optimize workflows first, bringing complete operational clarity before building and deploying secure AI nodes.
              </p>
            </div>
            
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1D21] to-[#0D1321] border border-[#1AD1B5]/30 relative text-center shadow-2xl">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest text-black bg-[#1AD1B5] px-4 py-1 rounded-full font-black">
                  Flagship Offer
                </span>
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-2">Differentiator Package</p>
                <div className="text-2xl md:text-3xl font-extrabold text-[#1AD1B5] tracking-tight font-sans my-4 uppercase">
                  Custom Blueprint
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                  Includes comprehensive operational audit, full SOP optimization, custom voice/text agent implementation, secure CRM trunks, and 30 days of live hyper-care optimization.
                </p>
                <button
                  onClick={() => scrollToSection('consultation')}
                  className="mt-6 w-full bg-[#1AD1B5] hover:bg-[#15bda3] text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 transition-all duration-300"
                >
                  Acquire Blueprint Framework
                </button>
              </div>
            </div>
          </div>

          {/* Chronological 5-Phase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Visual connector lines on desktop */}
            <div className="hidden md:block absolute top-[44px] left-[5%] right-[5%] h-0.5 bg-white/5 z-0" />

            {[
              {
                phase: "Phase 1",
                title: "Assessment",
                desc: "We perform a thorough audit of your current tech stack, call frequencies, and agent capabilities to draft an AI Readiness Assessment.",
                color: "from-[#1AD1B5] to-[#14baa1]"
              },
              {
                phase: "Phase 2",
                title: "Process Optimization",
                desc: "We trace every workflow to locate process leaks, eliminate bottlenecks, and formalize clear, digitized Standard Operating Procedures (SOPs).",
                color: "from-[#14baa1] to-[#1e9ba5]"
              },
              {
                phase: "Phase 3",
                title: "Automation Design",
                desc: "We plan custom data triggers, map ServiceTitan or Housecall Pro API endpoints, and outline the decision matrix for your AI Dispatchers.",
                color: "from-[#1e9ba5] to-[#5176ca]"
              },
              {
                phase: "Phase 4",
                title: "Implementation",
                desc: "We build and train the voice agents, assemble secure cloud API bridges, and run strict sandbox tests to certify perfect guardrails.",
                color: "from-[#5176ca] to-[#805af5]"
              },
              {
                phase: "Phase 5",
                title: "Optimization",
                desc: "We launch the integration, analyze transcript satisfaction scores, adjust voice models, and deliver weekly performance metrics.",
                color: "from-[#805af5] to-purple-800"
              }
            ].map((st, i) => (
              <div 
                key={i}
                className="relative z-10 p-6 rounded-2xl bg-[#0D1321]/80 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${st.color} flex items-center justify-center text-black font-black text-xs uppercase mb-4`}>
                    0{i + 1}
                  </div>
                  <p className="text-[10px] font-mono text-[#1AD1B5] uppercase tracking-wider font-bold mb-1">{st.phase}</p>
                  <h4 className="text-base font-extrabold text-white uppercase tracking-wide mb-3 leading-tight font-sans">{st.title}</h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* NEW SECTION: SECURE ENGINEERING & YEAR 1 GROWTH FORECAST */}
      <section id="security" className="relative z-10 py-20 md:py-32 bg-[#0A0D14]/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left box: Secure Engineering Column */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block">
                  Pristine Trust Standards
                </span>
                <h2 className="text-4xl md:text-5xl font-sans font-black text-white uppercase leading-tight mt-4">
                  How We Build <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5]">Securely</span>
                </h2>
                <p className="text-sm text-gray-300 font-light mt-4 leading-relaxed">
                  We treat data confidentiality and model reliability as non-negotiables. Mo-Blind's secure engineering framework guarantees zero data leakages, zero erratic pricing hallucination, and full platform redundancy.
                </p>

                <div className="space-y-6 mt-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shrink-0">
                      <Lock className="w-5 h-5 text-[#1AD1B5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white tracking-wide">Zero Client-Side Secret Exposure</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light mt-1">
                        All third-party tokens and API keys are mediated through server-side environment structures with secure token rotation proxies. Web browsers never see your access keys.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shrink-0">
                      <Shield className="w-5 h-5 text-[#1AD1B5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white tracking-wide">Strict Deterministic Guardrails</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light mt-1">
                        AI voice and text prompts are wrapped in state-machine code block code frameworks. This limits the AI's capacity to commit to unauthorized capabilities or erratic pricing discounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shrink-0">
                      <Cpu className="w-5 h-5 text-[#1AD1B5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white tracking-wide">Fail-Safe Dual-Path Voice Logic</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light mt-1">
                        Our systems feature redundant logic. If a live Web Speech synthesizer experience hits browser-iframe latency thresholds, the dispatcher immediately triggers real-time cloud-native fallback streams.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/5 pt-6 font-mono text-[11px] text-gray-500 leading-relaxed">
                🛡️ All solutions align strictly with GDPR standards, utilizing isolated, encrypted rest/transit storage boundaries with zero client-data utilization for model tuning.
              </div>
            </div>

            {/* Right box: Business Plan & Year 1 Growth Forecast Projections */}
            <div className="lg:col-span-6 bg-[#0D1321]/80 border border-white/5 rounded-3xl p-8 flex flex-col justify-between glow-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#805af5]/5 to-transparent pointer-events-none animate-pulse" />
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-[#1AD1B5]" />
                  <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest">Financial Performance Model</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-heading font-black text-white uppercase mb-1">
                  Year 1 Forecast
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Our updated diversified portfolio raises Year 1 target revenue to a healthier operational mix.
                </p>

                {/* Growth Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Moderate Original Forecast</span>
                    <span className="text-lg font-bold text-gray-300 font-sans block mt-1">$341,612</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#0E1D21] to-[#0A101C] border border-[#1AD1B5]/30">
                    <span className="text-[10px] font-mono text-[#1AD1B5] uppercase tracking-wider block font-bold">Revised Year 1 Target</span>
                    <span className="text-xl font-black text-white font-sans block mt-1">~$500,000</span>
                  </div>
                </div>

                {/* Table structure representing services projection */}
                <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
                  <div className="grid grid-cols-12 gap-2 bg-white/5 p-2.5 font-mono text-[10px] text-gray-400 uppercase tracking-widest font-black">
                    <span className="col-span-7">Service / Revenue Stream</span>
                    <span className="col-span-5 text-right">Revenue Plan</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[
                      { name: "AI Voice Agents (Flagship)", amt: "$120,000", type: "Recurring" },
                      { name: "Custom SaaS Development", amt: "$120,000", type: "Project + Rec" },
                      { name: "AI Automation Projects", amt: "$75,000", type: "Project" },
                      { name: "Process Optimization Consulting", amt: "$60,000", type: "Project" },
                      { name: "AI Transformation Consulting", amt: "$50,000", type: "Project" },
                      { name: "AI-Enabled Website Projects", amt: "$40,000", type: "Project" },
                      { name: "Partnership Optimization Retainers", amt: "$36,000", type: "Recurring" }
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 items-center hover:bg-white/5 transition-colors">
                        <div className="col-span-7 flex flex-col">
                          <span className="font-bold text-white tracking-wide">{row.name}</span>
                          <span className="text-[9px] font-mono text-gray-500">{row.type}</span>
                        </div>
                        <span className="col-span-5 text-right font-mono text-[#1AD1B5] font-bold">{row.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-6 flex items-center justify-between text-xs">
                <span className="font-mono text-gray-400">TOTAL COMBINED STREAM:</span>
                <span className="font-bold text-white text-base font-sans uppercase bg-gradient-to-r from-[#1AD1B5] to-[#805af5] text-transparent bg-clip-text font-black">~$500,000 Target Lift</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CRM INTEGRATION ECOSYSTEMS card pile */}
      <section id="integrations" className="relative z-10 py-20 md:py-32 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-sans font-extrabold uppercase leading-none text-white">
              Connected <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5] italic font-serif">Ecosystems</span>
            </h2>
            <p className="text-xs md:text-sm text-[#1AD1B5] font-mono tracking-widest mt-3 uppercase font-bold">
              Operational sync with trade tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: "Housecall Pro", type: "Trade Management", color: "from-[#1AD1B5] to-[#4096d2]" },
              { name: "ServiceTitan", type: "Enterprise Dispatch", color: "from-[#3c8db4] to-[#1AD1B5]" },
              { name: "Jobber", type: "Scheduling API", color: "from-[#1AD1B5] to-[#855df6]" },
              { name: "Google Calendar", type: "Standard Calendaring", color: "from-slate-800 to-slate-900" },
              { name: "Zapier Hooks", type: "Multi-system routing", color: "from-slate-800 to-slate-900" },
              { name: "HubSpot CRM", type: "Account mapping", color: "from-[#1AD1B5] to-[#855df6]" },
              { name: "Slack Alerts", type: "Dispatcher alerts", color: "from-[#855df6] to-slate-950" },
              { name: "Twilio voice", type: "Telephone trunking", color: "from-slate-800 to-slate-900" }
            ].map((ecosys, i) => (
              <div 
                key={i}
                className="p-6 bg-[#0D1321]/50 rounded-2xl border border-white/5 flex flex-col items-center justify-center glow-border"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${ecosys.color} flex items-center justify-center text-black font-extrabold text-sm uppercase mb-3`}>
                  {ecosys.name.charAt(0)}
                </div>
                <h4 className="text-white font-bold leading-none text-sm">{ecosys.name}</h4>
                <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-wide uppercase">{ecosys.type}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* DYNAMIC SAVINGS / ROI CALCULATOR */}
      <section id="roi" className="relative z-10 py-20 md:py-32 bg-[#0A0D14]/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left box: Sliders */}
            <div className="lg:col-span-6">
              <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest leading-none">Interactive Estimates</span>
              <h2 className="text-4xl md:text-6xl font-sans font-extrabold uppercase text-white mt-3 leading-none mb-6">
                Calculate <br/>Your ROI
              </h2>
              <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed mb-8">
                Every unanswered phone call is a customer that calls your competitor. Slide the meters below representing your business metrics and witness the instant revenue lift Captured with MO-Blind AI dispatcher.
              </p>

              <div className="space-y-6 bg-[#0D1321]/80 p-6 md:p-8 rounded-3xl border border-white/5">
                
                {/* Meter 1 */}
                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-xs text-gray-300">
                    <span className="uppercase tracking-wider">Missed Calls Per Month</span>
                    <span className="text-[#1AD1B5] font-bold text-sm bg-[#1AD1B5]/10 px-2.5 py-1 rounded">{monthlyMissedCalls} calls</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="150" 
                    value={monthlyMissedCalls}
                    onChange={(e) => setMonthlyMissedCalls(parseInt(e.target.value))}
                    className="w-full accent-[#1AD1B5] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Meter 2 */}
                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-xs text-gray-300">
                    <span className="uppercase tracking-wider">Average Ticket Size</span>
                    <span className="text-[#1AD1B5] font-bold text-sm bg-[#1AD1B5]/10 px-2.5 py-1 rounded">${averageTicketValue}</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="1500" 
                    step="50"
                    value={averageTicketValue}
                    onChange={(e) => setAverageTicketValue(parseInt(e.target.value))}
                    className="w-full accent-[#1AD1B5] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Meter 3 */}
                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-xs text-gray-300">
                    <span className="uppercase tracking-wider">Captured Bookings</span>
                    <span className="text-[#1AD1B5] font-bold text-sm bg-[#1AD1B5]/10 px-2.5 py-1 rounded">{captureRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="95" 
                    value={captureRate}
                    onChange={(e) => setCaptureRate(parseInt(e.target.value))}
                    className="w-full accent-[#1AD1B5] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

              </div>
            </div>

            {/* Right box: Savings Display */}
            <div className="lg:col-span-6">
              <div className="p-8 md:p-10 rounded-[36px] bg-gradient-to-br from-[#0D1321] to-[#05070D] border border-[#1AD1B5]/20 relative flex flex-col justify-between min-h-[420px] shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1AD1B5]/20 to-transparent" />
                
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#1AD1B5] uppercase font-extrabold border border-[#1AD1B5]/20 px-3 py-1 rounded-full bg-[#1AD1B5]/5">
                    Yearly Projected Lift
                  </span>
                  
                  <div className="mt-8">
                    <h4 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Total Managed Savings</h4>
                    <div className="text-5xl md:text-7xl font-extrabold text-[#1AD1B5] tracking-tighter font-sans leading-none drop-shadow">
                      ${calculatedSavings.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-6 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-400 block leading-none">New Bookings</span>
                      <span className="text-xl font-bold text-white mt-1 block font-sans">{calculatedBookings} jobs</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-400 block leading-none">Agent Cost</span>
                      <span className="text-xl font-bold text-[#1AD1B5] mt-1 block font-sans">&lt; 10% Ticket</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <p className="text-xs text-gray-400 leading-relaxed font-light">
                    *Estimates computed based on real home service performance benchmarks. Actual booking capture ratios vary based on local Tampa area request structures.
                  </p>
                  
                  <button 
                    onClick={() => scrollToSection('consultation')}
                    className="mt-6 w-full py-4 text-xs font-bold uppercase tracking-[0.2em] bg-[#1AD1B5] hover:bg-[#15bda3] text-black rounded-xl text-center transition-all duration-300 shadow-lg shadow-teal-500/10 cursor-pointer"
                    data-hover="true"
                  >
                    Lock in this frequency
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOUNDER'S STORY SECTION */}
      <section id="story" className="relative z-10 py-20 md:py-32 border-b border-white/5 bg-[#0A0D14]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Title, Subtitle & Portrait Image */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-xs font-mono text-[#1AD1B5] font-bold uppercase tracking-widest bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full px-4 py-1.5 inline-block mb-4">
                Founder's Story
              </span>
              <h2 className="text-4xl md:text-6xl font-sans font-black text-white uppercase leading-tight">
                My <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] to-[#805af5] italic font-serif">Story</span>
              </h2>
              <p className="text-[#1AD1B5] text-sm md:text-base font-semibold tracking-wide mt-3 max-w-sm">
                From Army medic to technology guide—always focused on people first.
              </p>

              {/* Portrait Container */}
              <div className="mt-8 relative group">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleProfilePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#1AD1B5] to-[#805af5] rounded-3xl blur opacity-30 group-hover:opacity-55 transition duration-500" />
                <div className="relative w-64 h-64 md:w-72 md:h-72 bg-[#0D1321] rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                  {!imageError ? (
                    <>
                      <img 
                        src={profilePhoto} 
                        alt="David Mohammed" 
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (profilePhoto !== '/assets/david-profile.svg' && profilePhoto !== '/david-profile.svg') {
                            setProfilePhoto('/assets/david-profile.svg');
                          } else {
                            setImageError(true);
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Photo Update Action Overlay on Hover */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload/Update Portrait Photo"
                        className="absolute bottom-3 right-3 bg-black/80 hover:bg-[#1AD1B5] text-white hover:text-black border border-white/20 hover:border-transparent p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider cursor-pointer opacity-80 group-hover:opacity-100"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Change Photo</span>
                      </button>
                    </>
                  ) : (
                    /* High-End, Custom fallback vector illustration matching the theme */
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0F1D21] to-[#0A0E17] text-center select-none relative cursor-pointer group/fallback"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/15 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Stylized Combat Medic Badge Fallback */}
                      <div className="relative mb-4 flex items-center justify-center">
                        <div className="absolute -inset-3 bg-[#1AD1B5]/10 rounded-full blur-sm" />
                        <div className="w-16 h-16 rounded-full bg-[#1AD1B5]/5 border border-[#1AD1B5]/30 flex items-center justify-center group-hover/fallback:border-[#1AD1B5]">
                          <Camera className="w-8 h-8 text-[#1AD1B5]" />
                        </div>
                      </div>
                      
                      <span className="text-2xl font-sans font-black tracking-widest text-white uppercase">
                        DAVID
                      </span>
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-1">
                        MOHAMMED
                      </span>
                      <p className="text-[9px] font-mono text-[#1AD1B5] uppercase tracking-widest mt-3 px-3 py-1 bg-[#1AD1B5]/5 border border-[#1AD1B5]/20 rounded-full flex items-center gap-1">
                        <Upload className="w-2.5 h-2.5" /> Click to Add Photo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Story Narrative Cards */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Origin card */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#0D1321]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#1AD1B5]/10 border border-[#1AD1B5]/20 flex items-center justify-center text-[#1AD1B5] shrink-0 mt-1">
                    <Star className="w-5 h-5 fill-[#1AD1B5]/5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">MILITARY SERVICE</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-2">The Combat Medic Origin</h3>
                    <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                      I started my career as a <b className="text-white">U.S. Army Combat Medic</b>. In that role, clarity wasn’t optional. When people were stressed, overwhelmed, or scared, my job was to stay calm, communicate clearly, and help them move forward. That experience shaped how I approach everything I do today.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transition card */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#0D1321]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#805af5]/10 border border-[#805af5]/20 flex items-center justify-center text-[#805af5] shrink-0 mt-1">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">20+ YEAR TRANSITION</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-2">The Transition to Enterprise</h3>
                    <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed mb-4">
                      After the military, I transitioned into the technology world, eventually leading large-scale cybersecurity and infrastructure projects for major organizations. Over more than 20 years, I managed thousands of projects with multimillion-dollar budgets and worked closely with executives, engineers, and frontline teams alike.
                    </p>
                    <div className="border-l-2 border-[#1AD1B5] pl-4 py-1 italic text-xs md:text-sm text-[#1AD1B5]/90 font-light">
                      "What stood out to me wasn’t the technology—it was how often people felt confused, intimidated, or left out of the conversation."
                    </div>
                  </div>
                </div>
              </div>

              {/* Philosophy / Today card */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#0D1321]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-1">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">TODAY'S PHILOSOPHY</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-2">How I Work Today</h3>
                    <p className="text-xs md:text-sm text-white font-medium leading-relaxed">
                      I believe in listening first, fixing processes, and then using AI intentionally—only where it makes sense.
                    </p>

                    {/* Certifications and credentials grid matching the PHP block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-[#1AD1B5]" />
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">EXPERIENCE</span>
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-normal">
                          20+ years leading complex technology and cybersecurity projects.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-[#805af5]" />
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">CERTIFICATIONS</span>
                        </div>
                        <p className="text-[10px] text-gray-300 font-light leading-normal font-sans">
                          PMP, CSM, CSPO, PCCSE, PCNSA, CCNA, ITIL 4, AWS Solution Architect, and Azure Admin certified.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* GEO KNOWLEDGE BASE & FAQ SECTION FOR SEO/AEO */}
      <FAQSection 
        onOpenChatbot={() => window.dispatchEvent(new CustomEvent('open-chatbot'))} 
        onNavigateContact={() => scrollToSection('consultation')} 
      />

      {/* CORE WORKSPACE REQUEST CONSULTATION FORM */}
      <section id="consultation" className="relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 bg-[#0D1321]/80 border border-white/5 rounded-[32px] p-8 md:p-12 relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1AD1B5]/20 to-transparent" />
          
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-sans font-black text-white leading-tight uppercase mb-2">
              Scale Your <br className="sm:hidden"/> Business
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-light max-w-lg mx-auto leading-relaxed">
              Ready to construct a tailored voice clone answering after-hours emergency dispatches for your trade business? Complete details below to request a specialist.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!formSubmitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  setFormSubmitted(true);
                }} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">Business Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Tampa Spark Service"
                      className="w-full bg-[#070A12]/80 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#1AD1B5]/50 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">Target Trade Sector</label>
                    <select className="w-full bg-[#070A12]/80 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#1AD1B5]/50 text-xs text-gray-300 cursor-pointer">
                      <option>Electrical Contractors</option>
                      <option>HVAC & Cooling Specialities</option>
                      <option>Plumbing & Rooter Services</option>
                      <option>Locksmith & Access Security</option>
                      <option>Pest & Yard Control</option>
                      <option>Sewer & Septic Engineers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">Contact Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Mohammad"
                      className="w-full bg-[#070A12]/80 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#1AD1B5]/50 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">Preferred Trunk Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g., (813) 555-0199"
                      className="w-full bg-[#070A12]/80 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#1AD1B5]/50 text-xs text-white"
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">Integration Focus & Workspace Goals</label>
                  <textarea 
                    rows={4}
                    placeholder="List any standard CRMs you wish to coordinate (e.g. Housecall Pro, Jobber, etc.) and what emergency dispatch routines are needed..."
                    className="w-full bg-[#070A12]/80 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#1AD1B5]/50 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1AD1B5] hover:bg-[#15bda3] text-black font-extrabold uppercase text-xs tracking-widest py-4 rounded-xl cursor-pointer shadow-lg shadow-teal-500/10 transition-all duration-300"
                  data-hover="true"
                >
                  Generate Custom Agent Workspace Proposal
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-4 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#1AD1B5]/10 border border-[#1AD1B5]/30 flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-[#1AD1B5]" />
                </div>
                <h3 className="text-2xl font-bold uppercase text-white tracking-wider mb-3">Workspace Request Registered</h3>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-8">
                  Welcome to <b>MO-Blind Solutions</b>! Your parameters are safely logged. One of our operational transformation specialists will connect with your dispatcher shortly.
                </p>
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs text-[#1AD1B5] hover:text-white underline tracking-wider font-mono uppercase bg-transparent border-none cursor-pointer"
                >
                  Submit another inquiry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-16 bg-[#070A13]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand Logo & Mission */}
            <div className="space-y-4">
              <Logo size="md" showText={true} />
              <p className="text-xs text-gray-400 leading-relaxed font-light max-w-xs">
                Empowering trade and service businesses to modernize operations, recover missed opportunities, and drive growth with secure AI systems and tailored integrations.
              </p>
            </div>

            {/* Column 2: Solutions Directory (Tabulated) */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Solutions Directory</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                {[
                  { label: 'AI Strategy & Audit', id: 'solutions', idx: 0 },
                  { label: 'Workflow Automation', id: 'solutions', idx: 1 },
                  { label: 'Natural Voice AI Agents', id: 'solutions', idx: 2 },
                  { label: 'Custom Business Software', id: 'solutions', idx: 3 },
                  { label: 'Built-to-Convert Websites', id: 'solutions', idx: 4 },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id, item.idx);
                      }}
                      className="hover:text-[#1AD1B5] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Platform Sections */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Platform Hub</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                {[
                  { label: 'Industries Served', id: 'industries' },
                  { label: 'Signature 5-Phase Blueprint', id: 'blueprint' },
                  { label: 'Secure Engineering & Hosting', id: 'security' },
                  { label: 'ROI Savings Calculator', id: 'roi' },
                  { label: 'Founder Story & History', id: 'story' },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id);
                      }}
                      className="hover:text-[#1AD1B5] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Quick Connections (Chat Bot & Contact Us) */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Instant Access</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li>
                  <a
                    href="#chatbot"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('chatbot');
                    }}
                    className="flex items-center gap-1.5 text-[#1AD1B5] hover:text-white transition-colors font-bold uppercase tracking-wider"
                  >
                    <MessageSquare className="w-3.5 h-3.5 animate-pulse" />
                    <span>Launch AI Chat Bot</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#contact-us"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('contact-us');
                    }}
                    className="flex items-center gap-1.5 text-white hover:text-[#1AD1B5] transition-colors font-bold uppercase tracking-wider"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Request Consultation</span>
                  </a>
                </li>
                <li className="pt-2 text-gray-400 border-t border-white/5">
                  <a 
                    href="tel:8137040306" 
                    className="flex items-center gap-1.5 hover:text-[#1AD1B5] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#1AD1B5]" />
                    <span>(813) 704-0306</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-mono">
            <span>Solutions Workspace Platform © 2026 Mo-Blind Solutions LLC. All rights reserved.</span>
            <span>Tampa, Florida</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
