import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_PROFICIENCY_LEVELS,
  AVAILABLE_TOPICS,
  AVAILABLE_VOICES,
} from "@/lib/constants";
import { LiveManager } from "@/services/liveManager";
import { ConnectionState, TranscriptItem } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type AudioStore = {
  conectionState: ConnectionState;
  error: string | null;
  isMuted: boolean;
  liveManagerInstance: LiveManager;
  transcript: TranscriptItem[];

  selectedLanguage: string;
  selectedProficiencyLevel: string;
  selectedTopic: string;
  selectedAssistantVoice: string;

  setSelectedLanguage: (lang: string) => void;
  setSelectedProficiencyLevel: (prof: string) => void;
  setSelectedTopic: (topic: string) => void;
  setSelectedAssistantvoice: (voice: string) => void;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMute: () => void;
};

export const useAudioStore = create<AudioStore>()(
  devtools((set, get) => ({
    connectionState: ConnectionState.DISCONNECTED,
    liveManagerInstance: null,
    error: null,
    isMuted: false,
    transcript: [],

    selectedLanguage: AVAILABLE_LANGUAGES[0].code,
    selectedProficiencyLevel:
      AVAILABLE_PROFICIENCY_LEVELS[0].label,
    selectedTopic: AVAILABLE_TOPICS[0],
    selectedAssistantVoice: AVAILABLE_VOICES[0].name,

    setSelectedLanguage: (lang: string) => {
      set({ selectedLanguage: lang });
    },
    setSelectedProficiencyLevel: (prof: string) => {
      set({ selectedProficiencyLevel: prof });
    },
    setSelectedTopic: (topic: string) => {
      set({ selectedTopic: topic });
    },
    setSelectedAssistantvoice: (voice: string) => {
      set({ selectedAssistantVoice: voice });
    },

    toggleMute: () => {
      const state = get();
      const newState = !state.isMuted;
      set({ isMuted: newState });
      state.liveManagerInstance.setMute(newState);
    },
    connect: async () => {
      const state = get();

      // get ephemeral token
      const response = await fetch("/api/token");
      if (!response.ok) {
        set({ error: "failed to generate token" });
      }

      const { token } = await response.json();

      if (
        state.conectionState ===
          ConnectionState.CONNECTING ||
        state.conectionState === ConnectionState.CONNECTED
      ) {
        return;
      }

      set({ error: null });

      // check permission
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch {
        set({ error: "Microphone permission denied" });
      }

      // create live manager (singleton)
      let manager = state.liveManagerInstance;
      if (!manager) {
        manager = new LiveManager(
          {
            onStateChange: (state) =>
              set({ conectionState: state }),
            onError: (err) => set({ error: err }),
            onTranscript: (sender, text, isPartial) => {
              return set((state) => {
                const newTranscript = [...state.transcript];

                const existingIndex =
                  newTranscript.findLastIndex((item) => {
                    return (
                      item.sender === sender &&
                      item.isPartial
                    );
                  });

                // partial message exists
                if (existingIndex !== -1) {
                  newTranscript[existingIndex] = {
                    ...newTranscript[existingIndex],
                    text,
                    isPartial,
                  };

                  return { transcript: newTranscript };
                } else {
                  if (text) {
                    newTranscript.push({
                      id: crypto.randomUUID(),
                      sender,
                      text,
                      isPartial,
                    });
                  }

                  return { transcript: newTranscript };
                }
              });
            },
            onAudioLevel: () => {},
          },
          token.name,
        );

        set({ liveManagerInstance: manager });
      }

      const selectedLang = AVAILABLE_LANGUAGES.find(
        (l) => l.code === state.selectedLanguage,
      );
      // create session
      manager.startSession({
        selected_assistant_voice:
          state.selectedAssistantVoice,
        selected_launguage_code:
          selectedLang?.code || "en-US",
        selected_launguage_name:
          selectedLang?.name || "English",
        selected_launguage_region:
          selectedLang?.region || "US",
        description: state.selectedTopic,
        selected_topic: state.selectedTopic,
        selected_proefficent_level:
          state.selectedProficiencyLevel,
      });
    },
    disconnect: async () => {
      const state = get();
      if (state.liveManagerInstance) {
        state.liveManagerInstance.disconnect();

        set({ liveManagerInstance: undefined });

        set({
          conectionState: ConnectionState.DISCONNECTED,
        });
      }
    },
  })),
);
