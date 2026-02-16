import { MODEL } from "@/lib/constants";
import {
  GoogleGenAI,
  Modality,
  Session,
} from "@google/genai";

export class LiveManager {
  private ai: GoogleGenAI;
  private activeSession: Session | null = null;

  constructor() {
    this.ai = new GoogleGenAI({
      // IMPORTANT: don't use this in production... (will use ephemeral tokens)
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });
  }

  async startSession() {
    console.log("starting the session");

    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction:
        "You are a helpful and friendly AI assistant.",
    };

    this.activeSession = await this.ai.live.connect({
      model: MODEL,
      config: config,
      callbacks: {
        onopen: () =>
          console.log("Connected to Gemini Live API"),
        onmessage: (message) => {
          console.log("message", message);
        },
        onerror: (e) => console.error("Error:", e.message),
        onclose: (e) => console.log("Closed:", e.reason),
      },
    });

    console.log("session", this.activeSession);
  }
}
