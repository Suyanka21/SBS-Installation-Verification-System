import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-50/50 py-12 text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky text-black font-bold text-sm">
              S
            </div>
            <div>
              <p className="text-white font-medium">Suyanka App Template</p>
              <p className="text-xs text-slate-500">Autonomous & Modular Agent Skills Architecture</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link href="/splash" className="hover:text-white transition-colors">
              Splash Screen
            </Link>
            <Link href="/auth" className="hover:text-white transition-colors">
              Authentication
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard Shell
            </Link>
            <a
              href="https://github.com/Suyanka21/agent-skills-starter-template"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="success">Anti-AI Design Verified</Badge>
            <Badge variant="outline">Next.js 14</Badge>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Suyanka App Template. Built with permanent reasoning protocols.
        </div>
      </div>
    </footer>
  );
}
