export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface TranscriptItem {
  id: string;
  sender: 'user' | 'model';
  text: string;
  isPartial?: boolean;
}

export interface AudioVolume {
  input: number;
  output: number;
}


export interface LiveManagerCallbacks {
  onStateChange: (state: ConnectionState) => void;
  onTranscript: (
    sender: "user" | "model",
    text: string,
    isPartial: boolean
  ) => void;
  onAudioLevel: (level: number, type: "input" | "output") => void;
  onError: (error: string) => void;
}

export interface ConnectConfig {
  selected_topic: string;
  description: string;

  selected_launguage_name: string;
  selected_launguage_code: string;
  selected_launguage_region: string;

  context: string;
  selected_proefficent_level: string;
  selected_assistant_voice: string;
}