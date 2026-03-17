import { geminiService } from "../config/gemini.js";

const allowedTypes = [
  "theft",
  "accident",
  "harassment",
  "damaged-property",
  "suspicious-activity",
  "other",
];

export const categorizeIncidentDescription = async (description) => {
  const prompt = `You are an AI assistant for a public safety application. Analyze the following incident description and respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

The JSON must have exactly these three fields:
- "type": one of [${allowedTypes.join(", ")}]
- "severity": one of ["controllable", "help-needed", "severe"]
- "summary": a concise one-line summary of the incident (max 15 words)

Incident description: "${description}"

Respond with only the JSON object.`;

  try {
    const response = await geminiService(prompt);
    const rawText = response.data.candidates[0].content.parts[0].text.trim();
    const parsed = JSON.parse(rawText);

    const validType = allowedTypes.includes(parsed.type)
      ? parsed.type
      : "other";
    const allowedSeverities = ["controllable", "help-needed", "severe"];
    const validSeverity = allowedSeverities.includes(parsed.severity)
      ? parsed.severity
      : "controllable";
    const validSummary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : description;

    return { type: validType, severity: validSeverity, summary: validSummary };
  } catch (error) {
    console.error("AI categorization failed, using defaults:", error.message);
    return { type: "other", severity: "controllable", summary: description };
  }
};
