"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutModal() {
  const { checkoutModalOpen, setCheckoutModalOpen, subscribeToPro, user } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!checkoutModalOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) return;
    setCvv(value);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsProcessing(true);

    // Simulate payment gateway authorization
    setTimeout(async () => {
      const { success, error } = await subscribeToPro();
      setIsProcessing(false);
      if (success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setCheckoutModalOpen(false);
          setPaymentSuccess(false);
          setCardNumber("");
          setExpiry("");
          setCvv("");
        }, 2000);
      } else {
        setErrorMsg(error || "Payment processing failed. Please try again.");
      }
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-card"
        >
          {/* Top header decoration */}
          <div className="h-2 bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500" />

          {/* Close button */}
          <button
            onClick={() => setCheckoutModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-8">
            {paymentSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-10"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-6">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Upgrade Successful!</h3>
                <p className="text-slate-500 text-sm">
                  Welcome to PixelAI Pro. Your 100 Pro credits have been added to your account!
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-sky-50 text-sky-500 rounded-2xl">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Upgrade to Pro</h3>
                    <p className="text-slate-500 text-xs font-medium">Instant premium access</p>
                  </div>
                </div>

                <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-800 font-bold text-base">PixelAI Pro Membership</span>
                    <span className="text-sky-600 font-extrabold text-lg">$15/mo</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Includes 100 high-speed AI image credits, priority generation, and unlimited download access.
                  </p>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 text-xs font-semibold text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 2222 3333 4444"
                        required
                        className="w-full px-4 py-3 pl-11 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                      />
                      <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Expiration</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        required
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all text-center font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="•••"
                        required
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all text-center font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 mt-2 bg-sky-500 text-white font-bold rounded-2xl shadow-md hover:bg-sky-600 transition-all disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
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
                        <span>Securing Connection...</span>
                      </>
                    ) : (
                      <span>Upgrade to Pro Now</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
