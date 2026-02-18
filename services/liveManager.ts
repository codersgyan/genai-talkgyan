import {
  base64ToUint8Array,
  createPCMBlob,
  decodeAudioData,
} from "@/lib/audioUtils";
import {
  INPUT_SAMPLE_RATE,
  MODEL,
  OUTPUT_SAMPLE_RATE,
} from "@/lib/constants";
import {
  GoogleGenAI,
  LiveServerMessage,
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
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

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

    //     {
    //     "modelTurn": {
    //         "parts": [
    //             {
    //                 "inlineData": {
    //                     "mimeType": "audio/pcm;rate=24000",
    //                     "data": "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"
    //                 }
    //             }
    //         ]
    //     }
    // }

    this.activeSession = await this.ai.live.connect({
      model: MODEL,
      config: config,
      callbacks: {
        onopen: () =>
          console.log("Connected to Gemini Live API"),
        onmessage: this.handleMessage.bind(this),
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
      const pcmBlob = createPCMBlob(
        event.data as Float32Array,
      );

      this.activeSession?.sendRealtimeInput({
        audio: pcmBlob,
      });
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

  async handleMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    if (serverContent?.interrupted) {
      this.stopAllAudio();
    }

    const base64Data =
      serverContent?.modelTurn?.parts?.[0].inlineData?.data;

    if (!base64Data) return;

    await this.playAudioChunk(base64Data as string);

    console.log("output context", this.outputAudioContext);
  }

  async playAudioChunk(audioData: string) {
    const uintData = base64ToUint8Array(audioData);

    if (!this.outputAudioContext || !this.outputNode)
      return;

    const audioBuffer = await decodeAudioData(
      uintData,
      this.outputAudioContext,
      OUTPUT_SAMPLE_RATE,
      1,
    );

    if (
      this.nextStartTime <
      this.outputAudioContext.currentTime
    ) {
      this.nextStartTime =
        this.outputAudioContext.currentTime;
    }

    const source =
      this.outputAudioContext.createBufferSource();

    source.buffer = audioBuffer;

    source.connect(this.outputNode);

    source.start(this.nextStartTime);

    this.nextStartTime += audioBuffer.duration;

    source.addEventListener("ended", () => {
      this.sources.delete(source);
    });

    this.sources.add(source);
  }

  async stopAllAudio() {
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });

    this.sources.clear();

    if (this.outputAudioContext) {
      this.nextStartTime =
        this.outputAudioContext?.currentTime;
    }
  }
}
