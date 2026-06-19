"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Copy, Download, Trash2, Coins, ArrowUpRight, ShieldCheck, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, credits, images, setCheckoutModalOpen } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!user) return null;

  const handleCopyPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (url: string, promptText: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `pixelai-${promptText.substring(0, 20).replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleDeleteMock = (id: string) => {
    // In mock mode, remove from localStorage
    const key = `pixelai_images_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((img: any) => img.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        // Force state update through context refresh
        window.dispatchEvent(new Event("storage"));
        // Since custom hook listener fires, we can also trigger a page refresh or wait
        // In our AuthContext we track via storage or standard state. Let's force a reload or handle manually.
        // Actually, let's make it simpler: reload the page or trigger context state update.
        // In AuthContext, we listen to images state. Let's make it refresh automatically.
        // Let's trigger a page refresh or simply let the user know it is removed.
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <section id="dashboard" className="py-16 max-w-6xl mx-auto px-4">
      {/* Dashboard Section Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            User Dashboard
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Welcome back, <span className="text-slate-700">{user.fullName}</span>
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="flex flex-wrap gap-3">
          {credits && (
            <div className="flex items-center space-x-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-soft">
              <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
                <Coins size={18} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                  Remaining Credits
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {credits.planType === "pro"
                    ? "Unlimited"
                    : `${credits.creditsRemaining} / 5`}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-soft">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
              {credits?.planType === "pro" ? (
                <ShieldCheck size={18} />
              ) : (
                <Sparkles size={18} />
              )}
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                Current Plan
              </span>
              <span className="text-sm font-bold text-slate-700 capitalize">
                {credits?.planType || "Free"} Plan
              </span>
            </div>
            {credits?.planType !== "pro" && (
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="ml-2 p-1 text-sky-500 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-all"
                title="Upgrade to Pro"
              >
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generated Images Gallery */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <span>Your Creation Gallery</span>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-500 rounded-full">
            {images.length}
          </span>
        </h3>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100/60 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
              <ImageIcon size={28} />
            </div>
            <h4 className="text-base font-bold text-slate-700">No images created yet</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              Use the text generator in the hero section above to bring your designs to life!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img) => (
              <motion.div
                key={img.id}
                layout
                className="group relative bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo grid */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                  {/* Backdrop overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleDownload(img.imageUrl, img.prompt)}
                      className="p-3 bg-white text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg"
                      title="Download Image"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleCopyPrompt(img.prompt, img.id)}
                      className="p-3 bg-white text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg"
                      title="Copy Prompt"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteMock(img.id)}
                      className="p-3 bg-white text-rose-500 rounded-2xl hover:bg-rose-50 transition-colors shadow-lg"
                      title="Delete Image"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Info summary */}
                <div className="p-4">
                  <p className="text-slate-700 text-xs font-semibold line-clamp-2 leading-relaxed">
                    "{img.prompt}"
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                    <span>
                      {new Date(img.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {copiedId === img.id && (
                      <span className="text-emerald-500 animate-pulse">
                        Prompt Copied!
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
