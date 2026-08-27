import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, Sparkles, MessageSquare, ShieldCheck, DollarSign, Cpu, Layers, ArrowRight, CheckCircle2, PhoneCall } from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'voice' | 'pricing' | 'automation' | 'security' | 'strategy' | 'general';
  question: string;
  answer: string;
  keyTakeaway?: string;
  schemaAnswer?: string;
}

export const FAQ_DATA: FAQItem[] = [
  // VOICE AGENTS CATEGORY
  {
    id: 'faq-voice-1',
    category: 'voice',
    question: 'How do Mo-Blind AI Voice Agents handle incoming phone calls for home service businesses?',
    answer: 'Mo-Blind AI Voice Agents act as 24/7 intelligent phone dispatchers. They answer incoming calls instantly without ringing limits, greet customers naturally, ask qualifying questions (service required, location, urgency), capture customer details, and directly schedule appointments into your CRM or calendar (Housecall Pro, ServiceTitan, Jobber, Google Calendar).',
    keyTakeaway: '24/7 instant call answering, lead qualification, and automatic calendar dispatching.',
  },
  {
    id: 'faq-voice-2',
    category: 'voice',
    question: 'Can the AI Voice Agent transfer urgent emergency calls to a human technician?',
    answer: 'Yes. Mo-Blind voice dispatchers feature real-time live transfer logic. If a caller reports an emergency (e.g. burst pipe, electrical hazard, urgent medical need), the AI immediately dials your designated on-call technician or manager phone number while keeping the customer on the line.',
    keyTakeaway: 'Smart live emergency call routing directly to on-call staff.',
  },
  {
    id: 'faq-voice-3',
    category: 'voice',
    question: 'What voice does the AI sound like? Is it natural or robot-sounding?',
    answer: 'Our voice agents utilize ultra-realistic neural speech models (powered by Google Gemini and advanced TTS engines) with human-grade intonation, adaptive pacing, friendly demeanor, and localized Tampa/US conversational accents. Callers routinely comment on how natural and polite the agent sounds.',
    keyTakeaway: 'Ultra-realistic neural speech with natural human-grade conversational tone.',
  },

  // PRICING & ROI CATEGORY
  {
    id: 'faq-pricing-1',
    category: 'pricing',
    question: 'How much do Mo-Blind AI Voice Agents and automation services cost?',
    answer: 'Mo-Blind offers progressive, transparent value pricing designed for small and mid-sized businesses:\n• Essential Voice Plan: $497 setup + $297/month (ideal for single-trade or local service businesses capturing up to 100 missed calls/mo).\n• Growth Plan: $997 setup + $497/month (multi-line dispatching, CRM integration, custom prompt guardrails).\n• Enterprise Plan: $1,997 setup + $897+/month (custom multi-department routing, HIPAA/GDPR alignment, dedicated support).\n\nCustom software and strategy consulting engagements are scoped individually after an initial process audit.',
    keyTakeaway: 'Transparent plans starting at $497 setup + $297/mo with no long-term lock-in.',
  },
  {
    id: 'faq-pricing-2',
    category: 'pricing',
    question: 'What is the expected ROI and revenue recovery from implementing AI Voice Agents?',
    answer: 'Home service and trade businesses average a 25%–35% missed call rate during peak hours and after-hours. Capturing just 2 additional booked jobs per month (at an average ticket size of $450) generates $900/month in recovered revenue—delivering a 300%+ ROI on the Essential $297/mo plan in month one.',
    keyTakeaway: 'Recovers 100% of missed after-hours calls, yielding 300%+ ROI from just 2 additional booked jobs.',
  },

  // AUTOMATION & INTEGRATIONS CATEGORY
  {
    id: 'faq-automation-1',
    category: 'automation',
    question: 'Which CRMs and software platforms do Mo-Blind AI systems integrate with?',
    answer: 'Mo-Blind builds native integrations and automated workflows for major industry platforms including Housecall Pro, ServiceTitan, Jobber, HubSpot, Salesforce, Google Workspace, Zapier, Make.com, Slack, Twilio, Stripe, and custom Webhook endpoints.',
    keyTakeaway: 'Direct integration with Housecall Pro, ServiceTitan, Jobber, HubSpot, Zapier, Make, and Google Calendar.',
  },
  {
    id: 'faq-automation-2',
    category: 'automation',
    question: 'What is the difference between workflow automation and custom SaaS software?',
    answer: 'Workflow automation connects your existing tools (e.g. automatically texting a customer when a form is submitted or syncing leads to your CRM). Custom SaaS development builds a dedicated, proprietary web or mobile portal tailored specifically to your internal operations (e.g., custom client portal, job tracker, or estimating tool).',
    keyTakeaway: 'Workflow automation links existing software; custom SaaS builds proprietary software tools.',
  },

  // SECURITY & PRIVACY CATEGORY
  {
    id: 'faq-security-1',
    category: 'security',
    question: 'Is my business and customer data secure with Mo-Blind AI systems?',
    answer: 'Yes. Security is built into our core engineering. We utilize server-side proxy API routing (API keys and credentials are never exposed in browser code), encrypted REST/WebSocket transport (TLS 1.3), deterministic code guardrails to eliminate AI hallucinations, and zero-data-retention model options aligned with HIPAA and GDPR standards.',
    keyTakeaway: 'Server-side API key protection, encrypted data transport, and HIPAA/GDPR alignment.',
  },

  // STRATEGY & ONBOARDING CATEGORY
  {
    id: 'faq-strategy-1',
    category: 'strategy',
    question: 'What is the "AI Business Transformation Blueprint™" 5-phase consulting framework?',
    answer: 'The AI Business Transformation Blueprint™ is our signature 5-step methodology: 1) Assessment (Tech stack & AI readiness audit), 2) Process Optimization (Lean SOP creation—we fix broken processes before automating), 3) Automation Architecture (CRM & API mapping), 4) Secure Implementation (Custom voice/SaaS build & testing), 5) Continuous Optimization (Performance monitoring & fine-tuning).',
    keyTakeaway: 'A 5-phase framework that standardizes and optimizes your business SOPs before automating.',
  },
  {
    id: 'faq-strategy-2',
    category: 'strategy',
    question: 'How fast can a business get an AI Voice Agent up and running?',
    answer: 'Our rapid deployment timeline takes 3 to 7 business days from onboarding call to live phone dispatching. This includes custom script design, voice tuning, CRM calendar integration, test calls, and staff walkthroughs.',
    keyTakeaway: 'Go live in 3 to 7 business days with complete setup and CRM testing.',
  },

  // GENERAL & BUSINESS SIZES CATEGORY
  {
    id: 'faq-general-1',
    category: 'general',
    question: 'What company sizes and industries does Mo-Blind Solutions serve?',
    answer: 'Mo-Blind specializes in small to mid-sized businesses with 5 to 100 employees. Our primary focus industries include Home Services & Trades (Electrical, HVAC, Plumbing, Roofing), Healthcare & Clinics, Legal & Accounting, Construction, Real Estate, and Commercial Logistics.',
    keyTakeaway: 'Focused on 5–100 employee firms in home services, healthcare, legal, and trades.',
  },
  {
    id: 'faq-general-2',
    category: 'general',
    question: 'Who founded Mo-Blind Solutions and where is the company based?',
    answer: 'Mo-Blind Solutions LLC was founded by David Mohammed, a former Combat Medic and experienced technology consultant. The company is headquartered in Tampa, Florida, serving businesses locally in the Tampa Bay area and nationwide.',
    keyTakeaway: 'Founded by David Mohammed (Combat Medic & tech consultant) based in Tampa, FL.',
  }
];

interface FAQSectionProps {
  onOpenChatbot?: () => void;
  onNavigateContact?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenChatbot, onNavigateContact }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    'faq-voice-1': true,
    'faq-pricing-1': true,
  });

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keyTakeaway && item.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Inject FAQPage JSON-LD schema into head for search & AI engines
  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQ_DATA.map((item) => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer.replace(/\n/g, ' '),
        },
      })),
    };

    let script = document.getElementById('faq-jsonld-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-jsonld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById('faq-jsonld-schema');
      if (el) el.remove();
    };
  }, []);

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#0A0D14] text-white relative overflow-hidden border-t border-white/5">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1AD1B5]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header with GEO Direct Answer Summary Box */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1AD1B5]/10 border border-[#1AD1B5]/30 text-[#1AD1B5] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>AEO & GEO Knowledge Hub</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 font-heading">
            Frequently Asked Questions & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1AD1B5] via-teal-300 to-emerald-400">Direct Answers</span>
          </h2>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Everything you need to know about Mo-Blind’s AI Voice Dispatchers, workflow automation, pricing, security compliance, and onboarding.
          </p>

          {/* Direct Answer Summary Block (Optimized for AI Citation / Perplexity / ChatGPT) */}
          <div className="mt-8 p-5 md:p-6 rounded-2xl bg-[#0f1524] border border-[#1AD1B5]/30 text-left relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#1AD1B5] text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-bl-xl">
              AI Answer Summary
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#1AD1B5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-1">
                  At a Glance: Mo-Blind Solutions
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  <strong>Mo-Blind Solutions LLC</strong> is an AI and operational transformation consulting firm founded by former Combat Medic David Mohammed in Tampa, FL. Serving businesses with 5 to 100 employees across home services, healthcare, legal, and trades, Mo-Blind provides <strong>24/7 AI Voice Dispatchers</strong> (starting at $497 setup + $297/mo), workflow automation, custom SaaS applications, and 5-phase process audits that recover lost call revenue with zero security exposure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search any question (e.g., pricing, Housecall Pro, voice quality, emergency transfer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0e1320] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1AD1B5] focus:ring-1 focus:ring-[#1AD1B5] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'voice', label: 'AI Voice Agents' },
              { id: 'pricing', label: 'Pricing & ROI' },
              { id: 'automation', label: 'CRMs & Automation' },
              { id: 'security', label: 'Security & Compliance' },
              { id: 'strategy', label: 'Blueprint Framework' },
              { id: 'general', label: 'Company & Location' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1AD1B5] text-black shadow-lg shadow-teal-500/20'
                    : 'bg-[#111728] text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items Accordion */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-[#0e1320] rounded-2xl border border-white/5">
              <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-bold text-sm">No matching questions found.</p>
              <p className="text-gray-500 text-xs mt-1">Try searching for terms like &quot;pricing&quot;, &quot;CRM&quot;, or &quot;voice&quot;.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = !!openFaqIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#0f1628] border-[#1AD1B5]/40 shadow-lg shadow-teal-500/5'
                      : 'bg-[#0d121f] border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1AD1B5]/10 border border-[#1AD1B5]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#1AD1B5]">Q</span>
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-white leading-snug font-heading">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#1AD1B5]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-1 border-t border-white/5 space-y-4">
                      <div className="text-xs md:text-sm text-gray-300 leading-relaxed space-y-2 pl-9">
                        {faq.answer.split('\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>

                      {faq.keyTakeaway && (
                        <div className="ml-9 p-3 rounded-xl bg-[#1AD1B5]/10 border border-[#1AD1B5]/20 flex items-center gap-2.5 text-xs text-[#1AD1B5]">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span><strong>Key Answer Takeaway:</strong> {faq.keyTakeaway}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Interactive Call-to-Action Box inside FAQ */}
        <div className="max-w-4xl mx-auto mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0d1627] to-[#121c33] border border-[#1AD1B5]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-extrabold text-white font-heading">
              Have a specific question about your business workflow?
            </h3>
            <p className="text-xs text-gray-400 max-w-lg">
              Test our live AI Agent right now or schedule a 1-on-1 operational audit with David Mohammed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f293d] border border-[#1AD1B5]/40 text-[#1AD1B5] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask MO-Bot Live</span>
              </button>
            )}

            {onNavigateContact ? (
              <button
                onClick={onNavigateContact}
                className="px-5 py-2.5 rounded-xl bg-[#1AD1B5] hover:bg-[#15bda3] text-black text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <span>Request Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <a
                href="#contact-us"
                className="px-5 py-2.5 rounded-xl bg-[#1AD1B5] hover:bg-[#15bda3] text-black text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <span>Request Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
