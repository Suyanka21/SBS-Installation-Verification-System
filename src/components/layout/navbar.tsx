"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck, ClipboardCheck } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-sky text-black font-extrabold text-base shadow-sm">
            SBS
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-white">SBS Tanks</span>
              <Badge variant="default" className="text-[10px] py-0 px-1.5 border-accent-sky/30 text-accent-sky">
                Verification System
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Installation Quality Assurance</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <Link href="/#workflow" className="text-slate-400 hover:text-white transition-colors">
            Verification Workflow
          </Link>
          <Link href="/#roles" className="text-slate-400 hover:text-white transition-colors">
            Roles & Responsibilities
          </Link>
          <Link href="/#standards" className="text-slate-400 hover:text-white transition-colors">
            QC Standards
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end mr-1">
                <span className="text-xs font-medium text-white">{user.name}</span>
                <span className="text-[10px] text-accent-sky font-mono">{user.role}</span>
              </div>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm" className="space-x-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Portal</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-slate-400 hover:text-accent-rose"
                title="Sign Out"
              >
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
                  Field Access
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
            href="/#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Verification Workflow
          </Link>
          <Link
            href="/#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Roles & Responsibilities
          </Link>
          <Link
            href="/#standards"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            QC Standards
          </Link>
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <Badge variant="outline" className="text-xs text-accent-sky">
                    {user.role}
                  </Badge>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-start space-x-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Open Verification Portal</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-accent-rose"
                >
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
                    Field Access
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
