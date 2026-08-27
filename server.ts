import express from "express";
import path from "path";
import { GoogleGenAI, Chat, Modality } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
});

// Helper to check if API key is configured
const getAPIKey = () => {
  return process.env.GEMINI_API_KEY || process.env.API_KEY || "";
};

const isApiKeyConfigured = () => {
  const key = getAPIKey();
  return key && key !== "PLACEHOLDER_API_KEY";
};

// Lazy builder for GoogleGenAI
const getAIClient = (): GoogleGenAI => {
  return new GoogleGenAI({ 
    apiKey: getAPIKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Agency Chat Session Store (In-Memory)
const agencySessions = new Map<string, any>();

const getAgencyChat = (sessionId: string, model: string = 'gemini-3.7-flash', forceCreate = false): Chat => {
  let session = agencySessions.get(sessionId);
  if (forceCreate || !session) {
    const ai = getAIClient();
    session = ai.chats.create({
      model: model,
      config: {
        systemInstruction: `You are 'MO-Bot', the expert AI Automation & Operational Transformation Consultant representing Mo-Blind Solutions LLC.
      
      Mo-Blind Solutions LLC is an AI Transformation, Automation, and Custom Software Consulting firm helping small and mid-sized businesses (5 to 100 employees) modernize operations, increase efficiency, and scale securely through intelligent systems.

      OUR VISION: To become the trusted AI Transformation Partner for small and mid-sized businesses seeking practical, measurable results through automation, intelligent systems, and digital innovation.
      OUR MISSION: We help businesses eliminate inefficiencies, automate operations, and accelerate growth through AI transformation, custom software, intelligent automation, and process optimization.

      SECURE ENGINEERING PART (How we build securely):
      - OAuth-Based Integrations & API Security: We implement standard secure proxy-mediated routing so credentials/API keys are never exposed in the browser.
      - Strict Deterministic Guardrails: We wrap models in strict code state-machines to prevent hallucinated pricing or commitments.
      - Enterprise Privacy: HIPAA and GDPR aligned data boundaries, utilizing encrypted rest/transit pipelines with zero model-training retention options.

      OUR UPDATED 7-SERVICE PORTFOLIO & VALUE PRICING:
      1. AI Transformation Consulting (Custom Project Scope): Help businesses map where AI fits, what to automate, expected ROI, and roadmap. Deliverables: AI Readiness Assessment, Technology Recommendations, Transformation Roadmap, ROI Analysis.
      2. Process Optimization Consulting (Custom Engagement): Workflow analysis, SOP creation, bottleneck identification, and efficiency improvements.
      3. AI Automation Solutions (Custom Work Scope): Build automations with Make, Zapier, APIs, CRM connections, and custom workflows (e.g., lead routing, proposal generation, onboarding, follow-ups).
      4. AI Voice Agents (Flagship | Recurring - Very progressive pricing entry points): Rapid ROI capture of 100% of missed after-hours calls. 
         - Essential: $497 setup, $297/month
         - Growth: $997 setup, $497/month
         - Enterprise: $1,997 setup, $897+/month
      5. Custom SaaS Applications (Custom Enterprise Build): Client portals, job trackers, CRM replacements, workflow platforms. Revenue model: Dev fee + hosting + retainer.
      6. Website Development (Custom Project Scope): Modern, AI-enabled websites with chat assistants, voice integrations, CRM connections, and SEO.
      7. Ongoing AI Optimization Partnership (Custom Retainer Scope): Monthly reviews, new automations, AI governance, performance reporting, system maintenance.

      OUR SIGNATURE FLAGSHIP OFFER:
      "AI Business Transformation Blueprint™" (Custom Blueprint Package):
      Our 5-phase consulting framework and differentiator:
      - Phase 1: Assessment (AI readiness & tech audit)
      - Phase 2: Process Optimization (Standardize & lean SOPs first—we fix before we automate)
      - Phase 3: Automation Design (CRM integration and system architecture)
      - Phase 4: Implementation (Build and securely test voice/SaaS models)
      - Phase 5: Optimization (Launch and fine-tune based on performance reports)

      REVENUE PROJECTIONS (Year 1 Target: ~$500,000 diversified):
      - Voice Agents: $120,000 | AI Consulting: $50,000 | Process Optimization: $60,000 | Automation Projects: $75,000 | Website Projects: $40,000 | SaaS Development: $120,000 | Retainers: $36,000.

      TARGET IDEAL INDUSTRIES:
      Home Services, Healthcare, Professional Services, Legal, Accounting, Real Estate, Construction, Nonprofits, Manufacturing, Logistics.

      Your goal: Answer inquiries professionally, reference details about our services and framework when requested, and guide users to complete our proposal form or schedule a session. Be warm, articulate, highly professional, and security-conscious.
      Keep responses relatively brief (around 50-70 words) for natural reading.`,
      },
    });
    agencySessions.set(sessionId, session);
  }
  return session;
};

// Electrician Chat Session Store (In-Memory)
const electricianSessions = new Map<string, any>();

const getElectricianChat = (sessionId: string, model: string = 'gemini-3.7-flash', forceReset = false): Chat => {
  let session = electricianSessions.get(sessionId);
  if (forceReset || !session) {
    const ai = getAIClient();
    session = ai.chats.create({
      model: model,
      config: {
        systemInstruction: `You are 'Sparky', the friendly, ultra-professional virtual AI Voice Dispatcher for Shocky Shock Electric in Tampa, FL.
      You are speaking on a live phone-demo line. Always respond in warm, natural, human-like vocal phrasing. Keep your sentences short, clear, and colloquial. Write exactly how a real customer service dispatcher speaks!

      Key business information:
      - Company: Shocky Shock Electric (serving the Tampa Bay area)
      - Hours: Monday to Friday standard booking. Saturday is by appointment only. Sundays closed, but available 24/7 for standby emergencies.
      - Specialties: panels, hot tubs, generator switches, outlets, ceiling fans, AC capacitor restoration, troubleshooting.

      CRITICAL CONVERSATIONAL DISPATCH WORKFLOW (You MUST follow this progression strictly and slowly. Do NOT skip any step, and only ask for ONE piece of information at a time. Do NOT combine questions):
      1. WELCOME & GREET: Greet the caller warmly and enthusiastically: "Thanks for calling Shocky Shock Electric, this is Sparky! How can we power up your day today?"
      2. PROBLEM GATHERING: Listen to their electrical issue or project details. Acknowledge their issue with empathy (e.g., "Oh, a broken breaker can be super stressful, but we can definitely get that sorted out for you!").
      3. GATHER NAME & CONFIRM SPELLING:
         - Ask for their name (e.g., "Can I start with your name, please?").
         - ONCE they provide their name, you MUST explicitly ask to confirm the spelling (e.g., "Just to make sure I have that exactly right, is that spelled S-A-M-A-N-T-H-A?").
      4. GATHER CALLBACK NUMBER: Ask for a good telephone number to reach them (e.g., "Thank you. And what is the best callback number for you in case we get disconnected?").
      5. GATHER SERVICE ADDRESS: Ask for the full street address where the work needs to be done (e.g., "Perfect. And what is the address where we will be doing this electrical work?").
      6. CHOOSE APPOINTMENT DATE/TIME & CONFIRM BACK:
         - Ask for their preferred day and time (e.g., "What day and time works best for us to send a technician out?").
         - ONCE they suggest a day/time, you MUST repeat it back and confirm it clearly (e.g., "Excellent, I have you scheduled for Tuesday afternoon at two PM. Our technician will head out then.").
      7. ASK IF THERE IS ANYTHING ELSE: Before wrapping up the call, you MUST explicitly ask if they need help with anything else (e.g., "Is there anything else I can help you with today?").
      8. DISPATCH SIGN-OFF: Close with a friendly and warm closing (e.g., "Alright! We've got you all set up. Have a wonderful rest of your day, and thanks for choosing Shocky Shock Electric!").

      Style and Vocal constraints:
      - Absolutely NO lists, hyphens, bullet points, asterisks, or markdown. Output clean, conversational, plain text only.
      - Keep sentences short. Ask for exactly ONE detail at a time so the conversation feels natural and has an easy, human back-and-forth flow.`,
      },
    });
    electricianSessions.set(sessionId, session);
  }
  return session;
};

// Local simulation of Sparky if API Key is not configured
function simulateSparkyLocal(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Thanks for calling Shocky Shock Electric, this is Sparky! How can we power up your day today?";
  }
  if (msg.includes("hour") || msg.includes("when are you open") || msg.includes("saturday")) {
    return "We are open Monday through Friday, and on Saturdays by appointment! But remember, we also have an electrician on call 24/7 for after-hours emergency calls!";
  }
  if (msg.includes("where") || msg.includes("tampa") || msg.includes("location")) {
    return "We are located right here in Tampa, Florida, and we serve the entire Tampa Bay area! Looking to get some electrical work scheduled here in town?";
  }
  if (msg.includes("breaker") || msg.includes("outlet") || msg.includes("hot tub") || msg.includes("garage") || msg.includes("fan") || msg.includes("ac") || msg.includes("capacitor") || msg.includes("troubleshoot")) {
    return "Oh yes, we absolutely specialize in that! Whether it's wiring and panel work, hot tubs, or swap-outs, we've got you covered. What's your name and number? I can get our technician booked for you right away!";
  }
  if (msg.includes("book") || msg.includes("schedule") || msg.includes("appointment") || msg.includes("call")) {
    return "I would love to help you get scheduled! Can I get your name, your phone number, and a brief description of what you need help with?";
  }
  
  return "Got it! We specialize in hot tubs, new breakers, generators, fans, and 24/7 troubleshooting here in Tampa. Can I get your name and number so our technician can reach out to help with this project?";
}

// Local simulation of MO-Bot if API Key is not configured or fails
function simulateAgencyLocal(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! I am MO-Bot, your expert AI Automation & Operational Transformation Consultant at Mo-Blind Solutions. How can I help modernize your business operations today?";
  }
  if (msg.includes("price") || msg.includes("cost") || msg.includes("pricing") || msg.includes("how much")) {
    return "Our pricing is highly transparent and ROI-focused! For our flagship AI Voice Agents, setup starts at $497 with a $297/monthly subscription. For custom automation, SaaS, or website projects, we provide tailored scopes. Would you like to review our signature 'AI Business Transformation Blueprint'?";
  }
  if (msg.includes("voice") || msg.includes("phone") || msg.includes("call") || msg.includes("dispatcher")) {
    return "AI Voice Agents are our flagship solution! They capture 100% of missed and after-hours calls with immediate, friendly responses. Setup starts at just $497, with Growth and Enterprise tiers available depending on your volume. Would you like to test our Tampa dispatcher demo above?";
  }
  if (msg.includes("automation") || msg.includes("zapier") || msg.includes("make")) {
    return "We specialize in custom automation solutions using tools like Make and Zapier, connecting your CRM, lead routing, and proposal systems to eliminate hours of manual entry. Let's discuss your specific workflows!";
  }
  if (msg.includes("blueprint") || msg.includes("assessment") || msg.includes("framework")) {
    return "Our signature AI Business Transformation Blueprint™ is a comprehensive 5-phase framework: Assessment, Process Optimization, Automation Design, Implementation, and Continuous Optimization. This ensures we fix your bottlenecks before we automate them!";
  }
  if (msg.includes("contact") || msg.includes("schedule") || msg.includes("book") || msg.includes("consult")) {
    return "I would be delighted to set up a consultation! Please complete the 'Tailored Operational Consultation' form on this page, or let me know a convenient day/time, and we'll schedule a strategy session.";
  }

  return "Thank you for reaching out! Mo-Blind Solutions specializes in AI Voice Agents, custom CRM automations, SaaS platforms, and operational blueprints designed to save time and reclaim lost revenue. Let me know what operational challenge you're looking to solve, or feel free to submit our consultation form below!";
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendChatMessageWithRetry(
  sessionId: string,
  message: string,
  getChatFn: (id: string, model: string, forceCreate: boolean) => Chat,
  fallbackSimulateFn?: (msg: string) => string
): Promise<string> {
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const chat = getChatFn(sessionId, model, false);
      
      // Enforce a strict 4.5s timeout per request so user never experiences long lag
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini request timeout")), 4500)
      );

      const response = await Promise.race([
        chat.sendMessage({ message }),
        timeoutPromise
      ]);

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt with model ${model} failed:`, err.message || err);
    }
  }

  // If both models failed or timed out, immediately return local fallback simulation
  if (fallbackSimulateFn) {
    console.warn("Falling back immediately to local simulation.");
    return fallbackSimulateFn(message);
  }

  throw lastError || new Error("Failed to communicate with Gemini API");
}

// REST API Endpoints
app.post("/api/chat/agency", async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!isApiKeyConfigured()) {
    return res.json({ 
      reply: simulateAgencyLocal(message)
    });
  }

  try {
    const replyText = await sendChatMessageWithRetry(
      sessionId,
      message,
      (id, model, force) => getAgencyChat(id, model, force),
      simulateAgencyLocal
    );
    return res.json({ reply: replyText });
  } catch (error) {
    console.error("Server Agency Error:", error);
    return res.json({ reply: simulateAgencyLocal(message) });
  }
});

app.post("/api/chat/electrician", async (req, res) => {
  const { message, sessionId = "default", resetSession = false } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!isApiKeyConfigured()) {
    return res.json({ reply: simulateSparkyLocal(message) });
  }

  try {
    const replyText = await sendChatMessageWithRetry(
      sessionId,
      message,
      (id, model, force) => getElectricianChat(id, model, force || resetSession),
      simulateSparkyLocal
    );
    return res.json({ reply: replyText });
  } catch (error) {
    console.error("Server Electrician Error:", error);
    return res.json({ reply: simulateSparkyLocal(message) });
  }
});

app.post("/api/tts", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (!isApiKeyConfigured()) {
    return res.json({ audio: null });
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say warmly and like a highly friendly professional office dispatcher: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    return res.json({ audio: base64Audio });
  } catch (error) {
    console.error("Server TTS Error:", error);
    return res.json({ audio: null });
  }
});

// Vite Middleware & Static Asset Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
