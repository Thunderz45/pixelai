"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { Check, ShieldCheck, Sparkles, Zap, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const { user, credits, setAuthModalOpen, setAuthModalTab, setCheckoutModalOpen } = useAuth();

  const handleSubscriptionClick = () => {
    if (!user) {
      setAuthModalTab("login");
      setAuthModalOpen(true);
    } else {
      setCheckoutModalOpen(true);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Intro header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Get started for free. Upgrade to Pro for high-speed generation and unlimited credits.
          </p>
        </div>

        {/* Info Highlights Card */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-4">
            <div className="p-3 bg-sky-100/50 text-sky-500 rounded-xl">
              <Coins size={22} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-1">Free Plan</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Enjoy 5 free high-resolution image credits automatically loaded upon sign up. No credit card or commitment required.
              </p>
            </div>
          </div>

          <div className="p-6 bg-sky-50/50 rounded-2xl border border-sky-100/80 flex items-start space-x-4">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-1">Premium Plan</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Unlock instant processing with our ultra-fast cluster, priority support queue, and unlimited monthly credits pool.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Card */}
          <div className="relative p-8 bg-white rounded-3xl border border-slate-200 shadow-soft flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full select-none">
                  Starter
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Free Plan</h3>
              <p className="mt-2 text-xs text-slate-400 font-medium">For curious hobbyists</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-800">$0</span>
                <span className="text-slate-400 text-xs"> / forever</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span>5 Free credits</span>
                </li>
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span>Basic Image Generation</span>
                </li>
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span>Standard Queue Processing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  setAuthModalTab("signup");
                  setAuthModalOpen(true);
                }
              }}
              disabled={!!user}
              className={`w-full py-3.5 rounded-2xl text-xs font-extrabold transition-all border ${
                user
                  ? "bg-slate-50 text-slate-400 border-slate-100 cursor-default"
                  : "bg-white text-sky-500 border-sky-100 hover:bg-sky-50"
              }`}
            >
              {user ? "Currently Active" : "Get Started"}
            </button>
          </div>

          {/* Pro Card */}
          <div className="relative p-8 bg-white rounded-3xl border-2 border-sky-400 shadow-md flex flex-col justify-between hover:scale-[1.01] transition-all duration-300">
            {/* Ribbon */}
            <div className="absolute -top-3.5 right-6 inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-sky-400 to-sky-500 text-white text-[10px] font-extrabold rounded-full shadow-sm uppercase tracking-wider">
              <Sparkles size={8} className="fill-current" />
              <span>Recommended</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-600 rounded-full select-none">
                  Creator
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Pro Plan</h3>
              <p className="mt-2 text-xs text-slate-400 font-medium">For power designers</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-800">$15</span>
                <span className="text-slate-400 text-xs"> / month</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span className="font-bold text-slate-700">100 Premium credits/mo</span>
                </li>
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span>Ultra-fast generation engine</span>
                </li>
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span>Credits replenishment automatically</span>
                </li>
                <li className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium">
                  <Check size={14} className="text-sky-500" />
                  <span>Priority Premium Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSubscriptionClick}
              className={`w-full py-3.5 rounded-2xl text-xs font-extrabold transition-all ${
                credits?.planType === "pro"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/50 flex items-center justify-center space-x-1.5"
                  : "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-100"
              }`}
            >
              {credits?.planType === "pro" ? (
                <>
                  <ShieldCheck size={14} />
                  <span>Active Pro Member</span>
                </>
              ) : (
                "Subscribe to Pro"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
