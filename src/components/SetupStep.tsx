import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Save, Wand2 } from "lucide-react";
import { cn } from "../lib/utils";

interface SetupStepProps {
  onGenerate: (data: SetupData) => void;
  isLoading: boolean;
  statusText?: string | null;
}

export interface SetupData {
  groqKey: string;
  nvidiaKey: string;
  story: string;
  characters: string;
  style: string;
  count: number;
}

const STYLES = ["Cartoon", "Realistic", "Anime", "Watercolor", "Comic", "Cinematic", "Cyberpunk"];
const COUNTS = [20, 25, 30];

export default function SetupStep({ onGenerate, isLoading, statusText }: SetupStepProps) {
  const [data, setData] = useState<SetupData>({
    groqKey: "",
    nvidiaKey: "",
    story: "",
    characters: "",
    style: "Anime",
    count: 20,
  });

  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const savedGroq = localStorage.getItem("groqKey");
    const savedNvidia = localStorage.getItem("nvidiaKey");
    if (savedGroq || savedNvidia) {
      setData((prev) => ({
        ...prev,
        groqKey: savedGroq || "",
        nvidiaKey: savedNvidia || "",
      }));
    }
  }, []);

  const handleSaveKeys = () => {
    localStorage.setItem("groqKey", data.groqKey);
    localStorage.setItem("nvidiaKey", data.nvidiaKey);
    setSavedMessage("Keys saved to local storage!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleGenerate = () => {
    if (!data.story.trim()) {
      alert("Please enter a story.");
      return;
    }
    if (!data.characters.trim()) {
      alert("Please enter character descriptions.");
      return;
    }
    onGenerate(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 mb-4">
          Story to Slideshow 🎬
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Transform your story into highly detailed scenes and generate stunning visual slideshows using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: API Keys & Preferences */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
              Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Groq API Key</label>
                <div className="relative">
                  <input
                    type={showGroqKey ? "text" : "password"}
                    value={data.groqKey}
                    onChange={(e) => setData({ ...data, groqKey: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-10"
                    placeholder="Enter Groq Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showGroqKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nvidia Stable Diffusion API Key</label>
                <div className="relative">
                  <input
                    type={showNvidiaKey ? "text" : "password"}
                    value={data.nvidiaKey}
                    onChange={(e) => setData({ ...data, nvidiaKey: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-10"
                    placeholder="Enter Nvidia API Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNvidiaKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleSaveKeys}
                  className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-pink-500/10"
                >
                  <Save size={16} />
                  Save Keys
                </button>
                {savedMessage && <span className="text-xs text-green-400">{savedMessage}</span>}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Style & Scenes</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Art Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setData({ ...data, style })}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-full border transition-all",
                        data.style === style
                          ? "bg-pink-500/20 text-pink-300 border-pink-500/50"
                          : "bg-black/40 text-gray-400 border-white/10 hover:border-white/30"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scene Count</label>
                <div className="flex gap-3">
                  {COUNTS.map((count) => (
                    <button
                      key={count}
                      onClick={() => setData({ ...data, count })}
                      className={cn(
                        "flex-1 py-2 text-sm rounded-xl border transition-all",
                        data.count === count
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                          : "bg-black/40 text-gray-400 border-white/10 hover:border-white/30"
                      )}
                    >
                      {count} Scenes
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Story & Characters */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
            <h2 className="font-heading text-xl font-bold text-white mb-4">The Narrative</h2>
            
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-300 mb-1">Your Story</label>
                <textarea
                  value={data.story}
                  onChange={(e) => setData({ ...data, story: e.target.value })}
                  placeholder="Once upon a time in a cyberpunk city..."
                  className="w-full flex-1 min-h-[200px] bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Character Descriptions</label>
                <input
                  type="text"
                  value={data.characters}
                  onChange={(e) => setData({ ...data, characters: e.target.value })}
                  placeholder="Leo: tall, short silver hair, cybernetic glowing blue arm. Maya:..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={cn(
            "group relative flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg md:text-xl text-white overflow-hidden transition-all",
            isLoading
              ? "bg-gray-600 cursor-not-allowed opacity-80"
              : "bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
          )}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
              <span>{statusText || "Generating Scenes..."}</span>
            </>
          ) : (
            <>
              <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Generate Scenes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
