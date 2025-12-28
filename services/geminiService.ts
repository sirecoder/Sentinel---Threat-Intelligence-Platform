
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Use process.env.API_KEY directly for initialization as per coding guidelines
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enrichIoC = async (iocValue: string, iocType: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform an automated threat intelligence enrichment for the following Indicator of Compromise (IoC). 
      Value: ${iocValue}
      Type: ${iocType}
      
      Provide a detailed report including potential malware families, associated threat actors, recent campaign activity (especially from the last 48 hours), and defensive recommendations.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Enrichment Error:", error);
    return "Failed to enrich IoC data at this time.";
  }
};

export const suggestFeeds = async (threatLandscape: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the current threat landscape: "${threatLandscape}", suggest 3 high-quality Open Source Intelligence (OSINT) or commercial threat intelligence feeds. 
      Include the Name, URL, Type (TAXII, RSS, or API), and why it is relevant for current threats.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              url: { type: Type.STRING },
              type: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["name", "url", "type", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Feed Suggestion Error:", error);
    return [];
  }
};

export const analyzeKillChain = async (campaignName: string, actor: string, events: any[]) => {
  const ai = getAIClient();
  try {
    const eventSummary = events.map(e => `[${e.stage}] ${e.title}: ${e.description}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a senior threat intelligence analyst, analyze the following cyber attack kill chain:
      Campaign: ${campaignName}
      Threat Actor: ${actor}
      Timeline of Events:
      ${eventSummary}
      
      Provide a comprehensive analysis including:
      1. Kill Chain Progression Assessment (What stage are they at?).
      2. Attacker Intent and Objectives.
      3. Predicted Next Steps: Based on the current stage, what is the most likely next move?
      4. Defensive Recommendations: How can we disrupt this specific kill chain?
      
      Format with clear professional headers.`,
    });
    return response.text;
  } catch (error) {
    console.error("Kill Chain Analysis Error:", error);
    return "Failed to perform tactical kill chain analysis.";
  }
};

export const generateRemediationPlan = async (cveId: string, title: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive technical remediation plan for the vulnerability ${cveId} (${title}). 
      Include:
      1. Executive Summary of the risk.
      2. Step-by-step technical patching instructions.
      3. Temporary workarounds if patching isn't immediate.
      4. Verification steps to ensure the fix is successful.
      5. Potential side effects to monitor.
      
      Format with clear headings and bullet points.`,
    });
    return response.text;
  } catch (error) {
    console.error("Remediation Plan Error:", error);
    return "Failed to generate remediation plan. Please try again later.";
  }
};

// Fix: Corrected contents parameter to use Content object with parts array for multimodal data
export const analyzeVisualForensics = async (base64Image: string, mimeType: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image for cybersecurity threats. Identify any suspicious code, C2 domains, shell commands, or phishing indicators visible in the screenshot. Provide a risk score from 1-10."
          }
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Visual Forensics Error:", error);
    return "Could not analyze the visual data.";
  }
};

export const analyzeAnomaly = async (eventDescription: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following security anomaly event and provide a risk assessment and potential root cause analysis.
      Event Description: ${eventDescription}
      
      Suggest immediate mitigation steps.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Anomaly Analysis Error:", error);
    return "Analysis unavailable.";
  }
};

export const suggestHuntQueries = async (target: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 professional Kusto Query Language (KQL) and 3 SQL queries for hunting ${target} in enterprise SIEM logs. 
      Format the output clearly with explanations for each query.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              query: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["language", "query", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Hunt Generation Error:", error);
    return [];
  }
};
