import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-50/50 py-12 text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky text-black font-extrabold text-sm">
              SBS
            </div>
            <div>
              <p className="text-white font-medium">SBS Tanks Kenya</p>
              <p className="text-xs text-slate-500">Installation Verification System (IVS)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link href="/auth" className="hover:text-white transition-colors">
              Field Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Verification Portal
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Human QC Approval Model</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Offline-First Evidence Capture</span>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-accent-sky/30 text-accent-sky text-[11px]">
              Governed Baseline
            </Badge>
            <Badge variant="success" className="text-[11px]">
              Anti-AI Design
            </Badge>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SBS Tanks. Installation Verification System — Structured, attributable quality compliance.
        </div>
      </div>
    </footer>
  );
}
