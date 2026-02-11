import { Navbar } from "@/components/navbar";

import RightSidebar from "@/components/right-sidebar";
import LeftSidebar from "@/components/left-sidebar";

import StatusPanel from "@/components/status-panel";
import ControlsPanel from "@/components/controls-panel";
import VisualizationPanel from "@/components/visualization-panel";

const App = () => {
  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden lg:flex flex-col h-full flex-none w-80 border-r">
          <LeftSidebar />
        </div>

        <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          {/* Top Status Bar */}
          <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
            <StatusPanel />
          </div>

          {/* Center Visualization (Takes available space) */}
          <div className="flex-1 w-full h-full flex items-center justify-center">
            <VisualizationPanel />
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center z-20 px-4 pointer-events-none">
            <div className="pointer-events-auto">
              <ControlsPanel />
            </div>
          </div>
        </main>

        <div className="hidden lg:flex flex-col h-full flex-none w-80 border-l">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default App;
