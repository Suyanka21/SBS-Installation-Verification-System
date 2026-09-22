"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Sparkles, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-sky to-sky-600 text-black font-bold text-base shadow-sm">
            S
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-white">Suyanka</span>
              <Badge variant="default" className="text-[10px] py-0 px-1.5">Template</Badge>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <Link href="/splash" className="text-slate-400 hover:text-white transition-colors">
            Splash Demo
          </Link>
          <Link href="/#features" className="text-slate-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#skills" className="text-slate-400 hover:text-white transition-colors">
            27 Agent Skills
          </Link>
          <Link href="/#docs" className="text-slate-400 hover:text-white transition-colors">
            Docs
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="secondary" size="sm" className="space-x-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-slate-400 hover:text-accent-rose">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-surface-50 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/splash"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Splash Demo
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/#skills"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            27 Agent Skills
          </Link>
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-start space-x-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Open Dashboard</span>
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full justify-start text-accent-rose">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
