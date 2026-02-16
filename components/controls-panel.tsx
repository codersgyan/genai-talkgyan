"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ConnectionState } from "@/types";
import { Button } from "@/components/ui/button";
import { MicSelector } from "@/components/ui/mic-selector";
import { useAudioStore } from "@/store/useAudioStore";

function ControlsPanel() {
  const { connect } = useAudioStore();

  const [selectedDevice, setSelectedDevice] =
    useState<string>("");

  const isConnected = false;
  const isConnecting = false;
  const isMuted = false;

  return (
    <div className="w-full max-w-[90vw] sm:max-w-fit mx-auto transition-all duration-300 ease-in-out">
      <div
        className={cn(
          "flex items-center justify-between sm:justify-center gap-3 sm:gap-4 p-3 sm:p-2",
          "rounded-2xl sm:rounded-full",
          "border",
          "backdrop-blur-xl shadow-xl dark:shadow-black/50",
          "transition-all duration-300",
        )}>
        {/* Mic Selector */}
        <div className="flex-1 sm:flex-none min-w-0 sm:px-2">
          <MicSelector
            value={selectedDevice}
            onValueChange={setSelectedDevice}
            // Pass global mute state here to reflect UI changes in the selector too
            muted={false}
            onMutedChange={() => {}}
            disabled={isConnecting}
            className="w-full sm:w-auto"
          />
        </div>

        <div className="hidden sm:block w-px h-8 mx-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. MUTE BUTTON (Visible only when Connected) */}
          {isConnected && (
            <Button
              onClick={() => {}}
              variant={"secondary"}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full",
                isMuted
                  ? "bg-red-100 text-red-600 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-500 dark:border-red-900/50"
                  : "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
              )}>
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* 2. CONNECT / DISCONNECT BUTTON */}
          {!isConnected && !isConnecting ? (
            <Button
              onClick={connect}
              size="lg"
              className={cn(
                "rounded-xl sm:rounded-full",
                "h-12 sm:h-11 px-6",
                "bg-primary text-primary-foreground font-semibold",
                "transition-all duration-300 active:scale-95",
              )}>
              <Mic className="h-5 w-5 mr-2" />
              <span>Connect</span>
            </Button>
          ) : (
            <Button
              onClick={() => {}}
              disabled={isConnecting}
              variant="destructive"
              size="lg"
              className={cn(
                "rounded-xl sm:rounded-full",
                "h-12 sm:h-11 px-6",
                "shadow-md hover:shadow-lg",
                "transition-all duration-300 active:scale-95",
              )}>
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <PhoneOff className="h-5 w-5 mr-2" />
              )}
              <span>
                {isConnecting ? "Connecting..." : "End"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlsPanel;
