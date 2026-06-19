"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, Download, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_PROMPTS = [
  "A futuristic cyberpunk workspace, cozy lighting, sky blue accents, 3D render",
  "Minimalist vector icon of a flying white dove, clean modern flat design",
  "An adorable baby panda astronaut floating in deep space, digital art, high quality",
  "Serene misty mountains at sunrise, reflections on a mirror-like lake, photographic style",
];

export default function Hero() {
  const { generateImage, actionLoading, user, credits, setAuthModalOpen } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [generatedImg, setGeneratedImg] = useState<{ url: string; prompt: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setErrorMsg("");

    const res = await generateImage(prompt);
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.image) {
      setGeneratedImg({
        url: res.image.imageUrl,
        prompt: res.image.prompt,
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleDownload = async () => {
    if (!generatedImg) return;
    try {
      const response = await fetch(generatedImg.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `pixelai-${generatedImg.prompt.substring(0, 20).replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(generatedImg.url, "_blank");
    }
  };

  const handleCopyLink = () => {
    if (!generatedImg) return;
    navigator.clipboard.writeText(generatedImg.url);
    alert("Image link copied to clipboard!");
  };

  return (
    <section className="py-12 md:py-20 max-w-4xl mx-auto px-4 text-center">
      {/* Badge promotion */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 font-extrabold text-xs mb-6 select-none"
      >
        <Sparkles size={12} className="fill-current" />
        <span>PixelAI Engine v2.0 is Live</span>
      </motion.div>

      {/* Main headings */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800 leading-[1.1] mb-5"
      >
        Create Stunning <span className="text-sky-500">AI Images</span> in Seconds
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-slate-500 text-base md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Generate high-quality AI images from simple text prompts. Fast, responsive, and completely responsive.
      </motion.p>

      {/* Generator Prompt Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-2xl mx-auto mb-6"
      >
        <form
          onSubmit={handleGenerate}
          className="flex flex-col sm:flex-row p-2 bg-white rounded-3xl shadow-card border border-slate-100 gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            id="hero-prompt-input"
            placeholder="Describe what you want to create..."
            className="flex-1 px-4 py-3 text-sm focus:outline-none text-slate-700 bg-transparent placeholder-slate-400"
            disabled={actionLoading}
          />
          <button
            type="submit"
            disabled={actionLoading || !prompt.trim()}
            id="hero-generate-btn"
            className="px-6 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-sky-100 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
          >
            {actionLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Imagining...</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {EXAMPLE_PROMPTS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-[11px] font-bold text-slate-500 hover:text-sky-500 bg-slate-100/50 hover:bg-sky-50 px-3 py-1.5 rounded-full border border-slate-100 transition-all text-left"
            >
              {suggestion.length > 50 ? suggestion.substring(0, 50) + "..." : suggestion}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Errors or Notification messages */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-xl mx-auto mb-6 p-4 text-xs font-semibold text-rose-500 bg-rose-50 rounded-2xl border border-rose-100"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Area */}
      <AnimatePresence>
        {(actionLoading || generatedImg) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto bg-white rounded-3xl p-4 shadow-card border border-slate-100/50 overflow-hidden"
          >
            {actionLoading ? (
              <div className="flex flex-col items-center justify-center aspect-square w-full rounded-2xl skeleton">
                <ImageIcon size={48} className="text-slate-300 animate-pulse mb-3" />
                <p className="text-slate-500 text-xs font-bold animate-pulse">
                  AI is crafting your vision...
                </p>
              </div>
            ) : (
              generatedImg && (
                <div className="space-y-4">
                  <div className="relative group overflow-hidden rounded-2xl aspect-square bg-slate-50 border border-slate-100">
                    <img
                      src={generatedImg.url}
                      alt={generatedImg.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left px-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
                      Generated Prompt
                    </span>
                    <p className="text-slate-700 text-sm font-semibold mt-0.5 leading-relaxed">
                      "{generatedImg.prompt}"
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                      title="Copy URL"
                    >
                      <LinkIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
