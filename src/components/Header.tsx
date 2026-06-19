"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, LogOut, LayoutDashboard, Coins } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, credits, setAuthModalOpen, setAuthModalTab, signOut, isMock } = useAuth();

  const handleAuthAction = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass shadow-soft border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform duration-200">
            <Sparkles size={18} className="fill-current" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">
            Pixel<span className="text-sky-500">AI</span>
          </span>
          {isMock && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 select-none">
              Dev Mode
            </span>
          )}
        </Link>

        {/* Navigation / Actions */}
        <nav className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Credit Status badge */}
              {credits && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 font-bold text-xs border border-sky-100">
                  <Coins size={14} />
                  <span>
                    {credits.planType === "pro"
                      ? "Pro (Unlimited)"
                      : `Credits: ${credits.creditsRemaining}/5`}
                  </span>
                </div>
              )}

              {/* Dashboard anchor link */}
              <a
                href="#dashboard"
                id="header-dashboard-link"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all text-xs font-bold"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Dashboard</span>
              </a>

              {/* Sign out */}
              <button
                onClick={signOut}
                id="header-logout-btn"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>

              {/* User Avatar */}
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border-2 border-sky-100 hover:scale-105 transition-transform select-none bg-sky-50"
                />
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => handleAuthAction("login")}
                id="header-login-btn"
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold transition-all"
              >
                Login
              </button>
              <button
                onClick={() => handleAuthAction("signup")}
                id="header-signup-btn"
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md shadow-sky-100 text-xs font-bold hover:shadow-lg transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
