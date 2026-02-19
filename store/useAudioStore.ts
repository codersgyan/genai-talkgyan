import { LiveManager } from "@/services/liveManager";
import { ConnectionState } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type AudioStore = {
  conectionState: ConnectionState;
  error: string | null;
  isMuted: boolean;
  liveManagerInstance: LiveManager;
  connect: () => Promise<void>;
  toggleMute: () => void;
};

export const useAudioStore = create<AudioStore>()(
  devtools((set, get) => ({
    connectionState: ConnectionState.DISCONNECTED,
    liveManagerInstance: null,
    error: null,
    isMuted: false,
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
          
        });

        set({ liveManagerInstance: manager });
      }

      // create session
      manager.startSession();
    },
  })),
);
