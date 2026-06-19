"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Mail, Lock, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, signUp, signIn, isMock } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      if (authModalTab === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error);
        } else {
          setSuccessMsg(
            isMock
              ? "Account created successfully!"
              : "Registration successful! Please check your email for the confirmation link to activate your account."
          );
          // Close modal will happen inside Context upon success, but we can do a local clean
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else if (authModalTab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else {
          setSuccessMsg("Signed in successfully!");
          setEmail("");
          setPassword("");
        }
      } else {
        // Forgot password simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSuccessMsg("Password reset link has been sent to your email.");
        setEmail("");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-card overflow-hidden"
        >
          {/* Top banner stripe */}
          <div className="h-2 bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500" />

          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-8">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {authModalTab === "login" && "Welcome Back"}
                {authModalTab === "signup" && "Get Started with PixelAI"}
                {authModalTab === "forgot" && "Reset Password"}
              </h3>
            </div>

            {/* Toggle tabs */}
            {authModalTab !== "forgot" && (
              <div className="flex bg-slate-50 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab("login");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authModalTab === "login"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authModalTab === "signup"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs font-medium text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100">
                  {successMsg}
                </div>
              )}

              {authModalTab === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full px-4 py-3 pl-11 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
                    />
                    <User className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                    className="w-full px-4 py-3 pl-11 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              {authModalTab !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-500">Password</label>
                    {authModalTab === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab("forgot");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="text-xs text-sky-500 hover:text-sky-600 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pl-11 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
                    />
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 mt-2 bg-sky-500 text-white font-bold rounded-2xl shadow-md hover:bg-sky-600 transition-all disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    <span>Please Wait...</span>
                  </>
                ) : (
                  <span>
                    {authModalTab === "login" && "Sign In"}
                    {authModalTab === "signup" && "Create Account"}
                    {authModalTab === "forgot" && "Send Reset Link"}
                  </span>
                )}
              </button>
            </form>

            {authModalTab === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-bold mt-4"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
