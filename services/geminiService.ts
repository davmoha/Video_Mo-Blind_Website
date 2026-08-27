/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Unique session IDs generated once per page load to manage separate context threads on the server
const agencySessionId = "agency_" + Math.random().toString(36).substring(2, 11);
const electricianSessionId = "electrician_" + Math.random().toString(36).substring(2, 11);

/**
 * Communicate with the Agency representative (MO-Bot)
 */
export const sendMessageToAgency = async (message: string): Promise<string> => {
  try {
    const response = await fetch("/api/chat/agency", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId: agencySessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "Connection interrupted. Let's try that again.";
  } catch (error) {
    console.error("Client Agency Error:", error);
    return "Signal faded. Please try sending your inquiry again in a moment.";
  }
};

/**
 * Communicate with Sparky, the Shocky Shock Electric agent
 */
export const sendMessageToElectrician = async (message: string, resetSession = false): Promise<string> => {
  try {
    const response = await fetch("/api/chat/electrician", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId: electricianSessionId,
        resetSession,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "Sorry, I missed that. Could you say that again?";
  } catch (error) {
    console.error("Client Electrician Error:", error);
    return "My lines got crossed for a second. What were you saying about your electrical issue?";
  }
};

/**
 * Generate human-grade, incredibly natural and friendly female speech from text
 */
export const generateHighQualityTTS = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.audio || null;
  } catch (error) {
    console.error("Failed to generate high quality Gemini TTS:", error);
    return null;
  }
};
