import React from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface ScenesStepProps {
  scenes: string[];
  onBack: () => void;
  onGenerateImages: () => void;
}

export default function ScenesStep({ scenes, onBack, onGenerateImages }: ScenesStepProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Setup
        </button>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/50">
          Generated {scenes.length} Scenes
        </span>
      </div>

      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3">Review Scenes</h2>
        <p className="text-gray-400">
          Here is your story broken down into prompts ready for image generation.
        </p>
      </div>

      <div className="space-y-4 mb-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {scenes.map((scene, index) => (
          <div key={index} className="flex gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-300 font-bold text-sm">
              {index + 1}
            </div>
            <p className="text-gray-300 leading-relaxed font-body text-sm md:text-base">
              {scene}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onGenerateImages}
          className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg md:text-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          Generate Images
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
