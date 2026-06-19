"use client";

import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Pricing from "../components/Pricing";
import Dashboard from "../components/Dashboard";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import CheckoutModal from "../components/CheckoutModal";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="animate-spin h-10 w-10 text-sky-500"
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
              <p className="text-slate-400 text-xs font-bold tracking-wide animate-pulse">
                Setting up workspace...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero generation area */}
            <Hero />

            {/* User dashboard visible when authenticated */}
            <AnimatePresence mode="wait">
              {user && (
                <motion.div
                  key="dashboard-section"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-slate-50/50 border-t border-slate-100"
                >
                  <Dashboard />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pricing Options */}
            <Pricing />
          </>
        )}
      </main>

      {/* Footer Details */}
      <Footer />

      {/* Pop-up Dialogs */}
      <AuthModal />
      <CheckoutModal />
    </div>
  );
}
