
import { GoogleGenAI, Type } from "@google/genai";

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
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini Enrichment Error:", error);
    return { text: "Failed to enrich IoC data at this time.", sources: [] };
  }
};

export const suggestFeeds = async (threatLandscape: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following threat intelligence focus area: "${threatLandscape}". 

      Based on this specific landscape, suggest exactly 3 high-fidelity threat intelligence sources (OSINT or commercial). 
      For each source, provide:
      1. A deep-dive justification explaining exactly how its data helps mitigate the specific threats mentioned in the landscape.
      2. 3-4 recommended tags for organizing this feed's data.
      3. The primary integration protocol (TAXII, RSS, or API).

      Focus on feeds that offer STIX/TAXII or REST API integrations.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The name of the intelligence provider." },
              url: { type: Type.STRING, description: "The official integration or website URL." },
              type: { type: Type.STRING, description: "The primary protocol used (TAXII, RSS, API)." },
              reason: { type: Type.STRING, description: "A detailed, technical explanation of relevance to the provided landscape." },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Recommended labels for this feed's data."
              }
            },
            required: ["name", "url", "type", "reason", "tags"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
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
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
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
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Remediation Plan Error:", error);
    return "Failed to generate remediation plan. Please try again later.";
  }
};

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
            text: "Identify all Indicator of Compromise (IoCs) in this image. Focus on IP addresses, domain names, file paths, shell commands, or suspicious process names. Provide a summary suitable for a threat hunter."
          }
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
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
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
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
      model: "gemini-3-pro-preview",
      contents: `As a top-tier security researcher, perform a live search for the latest TTPs and hunting queries related to: "${target}". 
      
      Your goal is to provide high-fidelity hunting patterns (KQL and SQL) based on current real-world observations.
      
      Format as a JSON array of objects with 'language', 'query', and 'description'.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
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
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Hunt Generation Error:", error);
    return [];
  }
};

export const getMitreTechniqueDetails = async (techniqueId: string, techniqueName: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed cybersecurity defense briefing for the MITRE ATT&CK technique: ${techniqueName} (${techniqueId}).`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("MITRE Technique Intel Error:", error);
    return "Failed to retrieve adversary intelligence for this technique.";
  }
};
