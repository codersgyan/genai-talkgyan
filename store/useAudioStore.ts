import { LiveManager } from "@/services/liveManager";
import { ConnectionState } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type AudioStore = {
  conectionState: ConnectionState;
  error: string | null;
  liveManagerInstance: LiveManager;
  connect: () => Promise<void>;
};

export const useAudioStore = create<AudioStore>()(
  devtools((set, get) => ({
    connectionState: ConnectionState.DISCONNECTED,
    liveManagerInstance: null,
    error: null,
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
        manager = new LiveManager();
        set({ liveManagerInstance: manager });
      }

      // create session
      manager.startSession();
    },
  })),
);
