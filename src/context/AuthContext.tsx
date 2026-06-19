"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, UserProfile } from "../lib/services/auth";
import { creditsService, UserCredits } from "../lib/services/credits";
import { generatorService, GeneratedImage } from "../lib/services/generator";

interface AuthContextType {
  user: UserProfile | null;
  credits: UserCredits | null;
  images: GeneratedImage[];
  loading: boolean;
  actionLoading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: "login" | "signup" | "forgot";
  setAuthModalTab: (tab: "login" | "signup" | "forgot") => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  generateImage: (prompt: string) => Promise<{ image: GeneratedImage | null; error: string | null }>;
  subscribeToPro: () => Promise<{ success: boolean; error: string | null }>;
  unsubscribeFromPro: () => Promise<{ success: boolean; error: string | null }>;
  refreshState: () => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup" | "forgot">("login");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (profile) => {
      setUser(profile);
      if (profile) {
        // Load credits and images
        try {
          const creds = await creditsService.getCredits(profile.id);
          setCredits(creds);
          const imgs = await generatorService.getImages(profile.id);
          setImages(imgs);
        } catch (err) {
          console.error("Error loading user details:", err);
        }
      } else {
        setCredits(null);
        setImages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to credits state changes
  useEffect(() => {
    const unsubscribe = creditsService.onCreditsChange((creds) => {
      setCredits(creds);
    });
    return () => unsubscribe();
  }, []);

  // Listen to images state changes
  useEffect(() => {
    const unsubscribe = generatorService.onImagesChange((imgs) => {
      setImages(imgs);
    });
    return () => unsubscribe();
  }, []);

  const refreshState = async () => {
    if (!user) return;
    const creds = await creditsService.getCredits(user.id);
    setCredits(creds);
    const imgs = await generatorService.getImages(user.id);
    setImages(imgs);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setActionLoading(true);
    const { user: profile, error } = await authService.signUp(email, password, fullName);
    setActionLoading(false);
    if (error) {
      return { error: error.message };
    }
    if (profile) {
      setUser(profile);
      setAuthModalOpen(false);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setActionLoading(true);
    const { user: profile, error } = await authService.signIn(email, password);
    setActionLoading(false);
    if (error) {
      return { error: error.message };
    }
    if (profile) {
      setUser(profile);
      setAuthModalOpen(false);
    }
    return { error: null };
  };

  const signOut = async () => {
    setActionLoading(true);
    await authService.signOut();
    setUser(null);
    setCredits(null);
    setImages([]);
    setActionLoading(false);
  };

  const generateImage = async (prompt: string) => {
    if (!user) {
      setAuthModalTab("login");
      setAuthModalOpen(true);
      return { image: null, error: "Please log in to generate images." };
    }

    if (credits && credits.planType === "free" && credits.creditsRemaining <= 0) {
      setCheckoutModalOpen(true);
      return { image: null, error: "You have run out of credits. Please upgrade to Pro." };
    }

    setActionLoading(true);
    
    // Deduct 1 credit
    const deductRes = await creditsService.deductCredit(user.id);
    if (!deductRes.success) {
      setActionLoading(false);
      setCheckoutModalOpen(true);
      return { image: null, error: deductRes.error?.message || "Out of credits." };
    }

    // Call AI engine
    const { image, error } = await generatorService.generateImage(user.id, prompt);
    setActionLoading(false);

    if (error) {
      // Revert credit deduction if generation failed
      if (credits && credits.planType === "free") {
        const key = `pixelai_credits_${user.id}`;
        localStorage.setItem(key, JSON.stringify({
          credits_remaining: credits.creditsRemaining,
          plan_type: credits.planType
        }));
        setCredits({
          ...credits,
          creditsRemaining: credits.creditsRemaining
        });
      }
      return { image: null, error: error.message };
    }

    return { image, error: null };
  };

  const subscribeToPro = async () => {
    if (!user) {
      setAuthModalTab("login");
      setAuthModalOpen(true);
      return { success: false, error: "Please log in to subscribe." };
    }
    setActionLoading(true);
    const { success, error } = await creditsService.subscribeToPro(user.id);
    setActionLoading(false);
    return { success, error: error ? error.message : null };
  };

  const unsubscribeFromPro = async () => {
    if (!user) return { success: false, error: "No user found" };
    setActionLoading(true);
    const { success, error } = await creditsService.unsubscribeFromPro(user.id);
    setActionLoading(false);
    return { success, error: error ? error.message : null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        images,
        loading,
        actionLoading,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        checkoutModalOpen,
        setCheckoutModalOpen,
        signUp,
        signIn,
        signOut,
        generateImage,
        subscribeToPro,
        unsubscribeFromPro,
        refreshState,
        isMock: authService.isMock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
