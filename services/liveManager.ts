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
  ConnectionState,
  LiveManagerCallbacks,
} from "@/types";
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
  private callbacks: LiveManagerCallbacks;

  constructor(callbacks: LiveManagerCallbacks) {
    this.ai = new GoogleGenAI({
      // IMPORTANT: don't use this in production... (will use ephemeral tokens)
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    this.callbacks = callbacks;
  }

  async startSession() {
    try {
      console.log("starting the session");

      // connecting
      this.callbacks.onStateChange(
        ConnectionState.CONNECTING,
      );

      const config = {
        responseModalities: [Modality.AUDIO],
        systemInstruction:
          "You are a helpful and friendly AI assistant.",
      };

      this.activeSession = await this.ai.live.connect({
        model: MODEL,
        config: config,
        callbacks: {
          onopen: () => {
            this.callbacks.onStateChange(
              ConnectionState.CONNECTED,
            );
          },
          onmessage: this.handleMessage.bind(this),
          onerror: (e) => {
            this.callbacks.onStateChange(
              ConnectionState.ERROR,
            );
            this.callbacks.onError("Could not connect.");
          },
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

      this.outputNode =
        this.outputAudioContext.createGain();

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
    } catch (e) {
      console.error(e);
      this.callbacks.onStateChange(ConnectionState.ERROR);
      this.callbacks.onError("Something went wrong.");
    }
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

    // source.connect(this.outputNode);
    source.connect(this.outputAudioContext.destination);

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
