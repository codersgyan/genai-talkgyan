import {
  INPUT_SAMPLE_RATE,
  MODEL,
  OUTPUT_SAMPLE_RATE,
} from "@/lib/constants";
import {
  GoogleGenAI,
  Modality,
  Session,
} from "@google/genai";

export class LiveManager {
  private ai: GoogleGenAI;
  private activeSession: Session | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private outputNode: GainNode | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null =
    null;
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

    this.inputAudioContext = new AudioContext({
      sampleRate: INPUT_SAMPLE_RATE,
    });

    this.outputAudioContext = new AudioContext({
      sampleRate: OUTPUT_SAMPLE_RATE,
    });

    if (this.inputAudioContext.state === "suspended") {
      this.inputAudioContext.resume();
    }

    if (this.outputAudioContext.state === "suspended") {
      this.outputAudioContext.resume();
    }

    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(
      this.outputAudioContext.destination,
    );

    await this.inputAudioContext.audioWorklet.addModule(
      "/worklets/mic-processor.js",
    );

    this.workletNode = new AudioWorkletNode(
      this.inputAudioContext,
      "mic-processor",
    );

    this.workletNode.port.onmessage = (event) => {
      console.log(
        "RECEIVED MESSAGE FROM AUDIO THREAD",
        event.data,
      );
    };

    this.mediaStream =
      await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

    this.inputSource =
      this.inputAudioContext.createMediaStreamSource(
        this.mediaStream,
      );

    this.inputSource.connect(this.workletNode);

    console.log("session", this.activeSession);
  }
}
