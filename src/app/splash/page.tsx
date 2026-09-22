"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Loading agent environment...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 12;
        if (next > 30 && next < 60) {
          setStatusMessage("Ingesting 27 agent skills & rules...");
        } else if (next >= 60 && next < 90) {
          setStatusMessage("Freezing anti-ai design foundation tokens...");
        } else if (next >= 90) {
          setStatusMessage("System ready. Welcome to Suyanka.");
        }
        return next > 100 ? 100 : next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-background">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent-sky/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-rose/10 blur-3xl" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-[11px] border-white/10 text-slate-400">
            v1.0.0
          </Badge>
          <span className="text-xs text-slate-500 font-mono">NEXT.JS 14</span>
        </div>
        <Badge variant="success" className="text-[11px] flex items-center space-x-1">
          <ShieldCheck className="h-3 w-3 mr-1" />
          <span>Agent Layer Active</span>
        </Badge>
      </div>

      {/* Center Branded Splash Core */}
      <div className="my-auto flex flex-col items-center text-center max-w-md z-10">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          {/* Animated pulsing ring */}
          <div className="absolute inset-0 rounded-2xl bg-accent-sky/20 animate-ping opacity-25" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-50 border border-white/20 shadow-xl">
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-accent-sky via-white to-sky-400">
              S
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Suyanka App
        </h1>
        <p className="text-sm text-slate-400 mb-8 max-w-sm">
          Autonomous starter foundation driven by 27 modular agent skills and defensive architecture.
        </p>

        {/* Progress Bar Container */}
        <div className="w-full max-w-xs space-y-2 mb-8">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-accent-sky to-sky-400 transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>{statusMessage}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <Button
            variant="primary"
            size="md"
            onClick={handleEnter}
            className="w-full justify-center space-x-2"
          >
            <span>{user ? "Open Dashboard" : "Enter Application"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push("/")}
            className="w-full text-slate-400 hover:text-white"
          >
            Explore Landing
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="z-10 text-center text-xs text-slate-600">
        Anti-AI Design • Supabase & Firebase Drizzle Ready • CodeRabbit DNA
      </div>
    </div>
  );
}
