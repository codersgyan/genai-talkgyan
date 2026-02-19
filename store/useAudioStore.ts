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
  connect: () => Promise<void>;
  toggleMute: () => void;
};

export const useAudioStore = create<AudioStore>()(
  devtools((set, get) => ({
    connectionState: ConnectionState.DISCONNECTED,
    liveManagerInstance: null,
    error: null,
    isMuted: false,
    transcript: [],
    toggleMute: () => {
      const state = get();
      const newState = !state.isMuted;
      set({ isMuted: newState });
      state.liveManagerInstance.setMute(newState);
    },
    connect: async () => {
      const state = get();

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
        // @ts-ignore
        manager = new LiveManager({
          onStateChange: (state) =>
            set({ conectionState: state }),
          onError: (err) => set({ error: err }),
          onTranscript: (sender, text, isPartial) => {
            return set((state) => {
              const newTranscript = [...state.transcript];

              const existingIndex =
                newTranscript.findLastIndex((item) => {
                  return (
                    item.sender === sender && item.isPartial
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
        });

        set({ liveManagerInstance: manager });
      }

      // create session
      manager.startSession();
    },
  })),
);
