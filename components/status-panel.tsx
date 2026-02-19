"use client";

import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/useAudioStore";
import { ConnectionState } from "@/types";
import { AlertCircle } from "lucide-react";

function StatusPanel() {
  const { conectionState, error } = useAudioStore();

  const isConnected =
    conectionState === ConnectionState.CONNECTED;
  const isConnecting =
    conectionState === ConnectionState.CONNECTING;

  return (
    <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-4 z-20 pointer-events-none">
      {/* Error Toast */}
      {error && (
        <div className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-4 py-2 rounded-full text-sm border border-red-200 dark:border-red-500/20 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 pointer-events-auto">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Status Badge */}
      <div
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-500 flex items-center gap-2 backdrop-blur-sm shadow-sm",

          // 1. Connecting -> BLUE
          isConnecting
            ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 animate-pulse"
            : // 2. Connected -> GREEN (Emerald)
              isConnected
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : // 3. Default (Ready) -> YELLOW / AMBER (Theme Aligned)
                "bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#ffa809]/10 dark:text-[#ffa809] dark:border-[#ffa809]/20",
        )}>
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            // Dot Color
            isConnecting
              ? "bg-blue-500"
              : isConnected
                ? "bg-emerald-500"
                : "bg-[#ffa809]", // Your Brand Yellow
          )}
        />
        {isConnecting
          ? "Connecting..."
          : isConnected
            ? "Live Session"
            : "Ready to Talk"}
      </div>
    </div>
  );
}

export default StatusPanel;
