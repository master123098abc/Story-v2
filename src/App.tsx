import React, { useState } from "react";
import SetupStep, { type SetupData } from "./components/SetupStep";
import ScenesStep from "./components/ScenesStep";
import ImagesStep from "./components/ImagesStep";
import { type Step } from "./types";

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>("setup");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [scenes, setScenes] = useState<string[]>([]);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleGenerateScenes = async (data: SetupData) => {
    setSetupData(data);
    setIsGeneratingScenes(true);
    setError(null);
    setStatusText("Generating scenes with Groq...");

    try {
      const response = await fetch("/api/generate-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate scenes");
      }

      const resData = await response.json();
      setScenes(resData.scenes);
      setCurrentStep("scenes");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGeneratingScenes(false);
      setStatusText(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white selection:bg-pink-500/30 font-body overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Main Content Area */}
      <main className="relative z-10 pt-12 pb-24 px-4 min-h-screen flex flex-col">
        {error && (
          <div className="max-w-4xl mx-auto w-full mb-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center justify-between">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        {currentStep === "setup" && (
          <SetupStep onGenerate={handleGenerateScenes} isLoading={isGeneratingScenes} statusText={statusText} />
        )}
        
        {currentStep === "scenes" && (
          <ScenesStep 
            scenes={scenes} 
            onBack={() => setCurrentStep("setup")} 
            onGenerateImages={() => setCurrentStep("images")}
          />
        )}
        
        {currentStep === "images" && setupData && (
          <ImagesStep 
            scenes={scenes} 
            nvidiaKey={setupData.nvidiaKey} 
            onBack={() => setCurrentStep("scenes")} 
          />
        )}
      </main>
    </div>
  );
}
