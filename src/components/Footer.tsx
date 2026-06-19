"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={16} className="fill-current" />
            </div>
            <span className="font-extrabold text-lg text-white">
              Pixel<span className="text-sky-400">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generate stunning high-quality AI images in seconds.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("This is a demo page. Privacy Policy is currently mock.");
            }}
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("This is a demo page. Terms of Service are currently mock.");
            }}
            className="hover:text-white transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="mailto:support@pixelai.example.com"
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-600 font-medium">
        &copy; {currentYear} PixelAI Inc. All rights reserved. Simulated Stripe and Supabase Sandbox.
      </div>
    </footer>
  );
}
