"use client";

import Image from "next/image";
import { Orb } from "@/components/ui/orb";
import { LiveWaveform } from "./ui/live-waveform";

function VisualizationPanel() {
  const isConnected = true;
  const isConnecting = false;
  const agentState = "talking";

  // Logic to pulsate the logo based on output volume
  // Base scale is 1. We add a fraction of the audio level.
  // We clamp the level to avoid massive explosions of the logo if audio peaks.
  const activeScale = 1;
  const logoScale =
    isConnected && agentState === "talking"
      ? activeScale
      : 1;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl -mt-16">
      <div className="relative w-64 h-64 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* The Orb Background */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Orb
            colors={["#FFD439", "#FFD439"]}
            agentState={
              isConnected ? agentState : "thinking"
            }
            volumeMode="manual"
            manualInput={isConnected ? 1 : 0}
            manualOutput={isConnected ? 1 : 0}
          />
        </div>

        {/* The Center Logo */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl transition-transform duration-100 ease-out will-change-transform bg-black/20 backdrop-blur-sm border border-white/10"
            style={{
              transform: `scale(${logoScale})`,
            }}>
            {/* Replace /logo.png with your actual path */}
            {/* Using standard img tag for simplicity, or use Next/Image */}
            <Image
              height={500}
              width={500}
              src="/logo.png"
              alt="Agent Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="h-24 w-full max-w-xs sm:max-w-md flex items-center justify-center mt-8 opacity-80 z-10">
        <LiveWaveform
          active={isConnected}
          processing={isConnecting}
          mode="static"
          barColor={"#ffa809"}
          barWidth={4}
          barGap={4}
          height={80}
          fadeEdges={true}
        />
      </div>
    </div>
  );
}

export default VisualizationPanel;
