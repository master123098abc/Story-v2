import React, { useEffect, useState, useRef } from "react";
import { Download, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { type GeneratedImage } from "../types";
import { cn } from "../lib/utils";

interface ImagesStepProps {
  scenes: string[];
  nvidiaKey: string;
  onBack: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ImagesStep({ scenes, nvidiaKey, onBack }: ImagesStepProps) {
  const [images, setImages] = useState<GeneratedImage[]>(
    scenes.map((scene) => ({
      scenePrompt: scene,
      status: "pending",
    }))
  );
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateAllImages = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setHasStarted(true);
    abortControllerRef.current = new AbortController();
    
    if (!nvidiaKey) {
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "error", errorMessage: "No Nvidia Key provided." }))
      );
      setIsGenerating(false);
      return;
    }

    for (let i = 0; i < scenes.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break;
        setCurrentIndex(i);
        
        setImages((prev) =>
          prev.map((img, idx) => (idx === i ? { ...img, status: "generating" } : img))
        );

        let success = false;
        let attempt = 0;
        const maxRetries = 10;

        while (attempt < maxRetries && !success && !abortControllerRef.current?.signal.aborted) {
          attempt++;

          try {
            const response = await fetch("/api/generate-image", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ prompt: scenes[i], nvidiaKey }),
              signal: abortControllerRef.current?.signal,
            });

            if (!response.ok) {
              if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds before retry
                continue;
              }
              throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            
            if (blob.type.includes("application/json")) {
               throw new Error("Unexpected JSON response instead of image");
            }

            const blobUrl = URL.createObjectURL(blob);
            
            setImages((prev) =>
              prev.map((img, idx) =>
                idx === i ? { ...img, status: "success", blobUrl } : img
              )
            );
            success = true;
          } catch (error: any) {
            if (error.name === "AbortError") return;
            
            if (attempt < maxRetries && (error.message.includes("503") || error.message.includes("429"))) {
               continue;
            }

            console.error("Nvidia API failed:", error);
            setImages((prev) =>
              prev.map((img, idx) =>
                idx === i ? { ...img, status: "error", errorMessage: error.message } : img
              )
            );
            break;
          }
        }

        // Wait 2s between successful API calls or final failures to avoid rate limits on next images
        if (i < scenes.length - 1 && !abortControllerRef.current?.signal.aborted) {
          await new Promise(r => setTimeout(r, 2000));
        }
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDownload = async (url: string, index: number) => {
    try {
      if (!url.startsWith('blob:')) {
        const res = await fetch(url);
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = `scene-${index + 1}.jpg`;
      a.click();
      if (!url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  const handleDownloadAll = async () => {
    const successfulImages = images.filter((img) => img.status === "success" && img.blobUrl);
    
    for (let i = 0; i < successfulImages.length; i++) {
        const img = successfulImages[i];
        handleDownload(img.blobUrl!, scenes.indexOf(img.scenePrompt));
        await sleep(300); // small delay between downloads
    }
  };

  const completedCount = images.filter((img) => img.status === "success" || img.status === "error").length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in slide-in-from-right-8 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Scenes
        </button>
        
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-3">
             <span className="font-heading text-lg text-white">
                Generating Images
             </span>
             <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium border border-pink-500/50">
               {completedCount} / {scenes.length}
             </span>
          </div>
          {isGenerating && (
             <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                 style={{ width: `${(completedCount / scenes.length) * 100}%` }}
               />
             </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        {!hasStarted ? (
          <button
            onClick={generateAllImages}
            disabled={isGenerating}
            className={cn(
              "flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-lg text-white transition-all",
              isGenerating
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
            )}
          >
            Start Generating Images
          </button>
        ) : (
          <div /> // Spacer if started so download button stays on right
        )}

        <button
          onClick={handleDownloadAll}
          disabled={isGenerating || images.filter(i => i.status === "success").length === 0}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white transition-all",
            isGenerating || images.filter(i => i.status === "success").length === 0
              ? "bg-white/5 text-white/40 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95"
          )}
        >
          <Download size={18} />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
          >
            <div className="aspect-square w-full bg-black/40 relative flex items-center justify-center p-6">
              {img.status === "pending" && (
                 <div className="text-gray-500 flex flex-col items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                     {index + 1}
                   </div>
                   <span className="text-sm">Queued</span>
                 </div>
              )}
              {img.status === "generating" && (
                 <div className="text-pink-400 flex flex-col items-center gap-3">
                   <Loader2 className="w-8 h-8 animate-spin" />
                   <span className="text-sm font-medium animate-pulse">Generating...</span>
                 </div>
              )}
              {img.status === "error" && (
                 <div className="text-red-400 flex flex-col items-center gap-2 text-center">
                   <AlertCircle className="w-8 h-8 mb-1" />
                   <span className="text-sm font-medium">Failed</span>
                   <span className="text-xs text-red-500/70">{img.errorMessage}</span>
                 </div>
              )}
              {img.status === "success" && img.blobUrl && (
                 <img 
                   src={img.blobUrl} 
                   alt={`Scene ${index + 1}`} 
                   className="w-full h-full object-cover animate-in fade-in duration-700" 
                 />
              )}
              
              {/* Overlay Download Button */}
              {img.status === "success" && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDownload(img.blobUrl!, index)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold hover:scale-105 active:scale-95 transition-all"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Scene {index + 1}
                {img.status === "success" && <CheckCircle2 size={14} className="text-green-400" />}
              </div>
              <p className="text-sm text-gray-300 font-body line-clamp-3 hover:line-clamp-none transition-all cursor-default">
                {img.scenePrompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
