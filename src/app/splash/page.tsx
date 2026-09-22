"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing verification environment...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 15;
        if (next > 30 && next < 60) {
          setStatusMessage("Verifying offline cache & local storage...");
        } else if (next >= 60 && next < 90) {
          setStatusMessage("Synchronizing active SBS guideline templates...");
        } else if (next >= 90) {
          setStatusMessage("System ready. Welcome to SBS Tanks IVS.");
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
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-emerald/10 blur-3xl" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-[11px] border-white/10 text-slate-400">
            v1.0.0 Pilot
          </Badge>
          <span className="text-xs text-slate-500 font-mono">NEXT.JS 14</span>
        </div>
        <Badge variant="success" className="text-[11px] flex items-center space-x-1">
          <ShieldCheck className="h-3 w-3" />
          <span>QC Compliance Engine</span>
        </Badge>
      </div>

      {/* Center Branding & Progress */}
      <div className="flex flex-col items-center text-center max-w-md z-10 space-y-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-sky to-sky-700 text-black font-black text-2xl shadow-xl shadow-accent-sky/20 border border-white/20">
          SBS
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Installation Verification System
          </h1>
          <p className="text-sm text-slate-400">
            Structured, requirement-linked quality assurance for remote SBS water tanks.
          </p>
        </div>

        {/* Progress bar container */}
        <div className="w-full space-y-2 pt-4">
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>{statusMessage}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-200">
            <div
              className="h-full bg-gradient-to-r from-accent-sky to-accent-emerald transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Enter Button when ready */}
        <div className="pt-4 h-12 flex items-center justify-center">
          {progress >= 100 && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleEnter}
              className="animate-in fade-in zoom-in-95 duration-300 space-x-2 shadow-lg shadow-accent-sky/20"
            >
              <span>{user ? "Continue to Portal" : "Sign In to Field Portal"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between z-10 text-xs text-slate-500 border-t border-white/5 pt-4">
        <span>Attributable Quality Governance</span>
        <span className="mt-2 sm:mt-0">Human QC Approval • Offline-First</span>
      </div>
    </div>
  );
}
