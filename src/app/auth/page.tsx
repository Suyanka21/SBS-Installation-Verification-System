"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, SbsRole } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, User as UserIcon, ArrowRight, Zap, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const { signIn, signUp, signInDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<SbsRole>("Lead Installer");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify credentials.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(name, email, password, role);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: SbsRole) => {
    setError(null);
    try {
      setIsSubmitting(true);
      await signInDemo(demoRole);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign-in failed.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      {/* Ambient background blur */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-accent-sky/10 blur-3xl" />

      {/* Brand logo header */}
      <div className="mb-6 text-center z-10">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-sky text-black font-extrabold text-lg shadow-sm">
            SBS
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SBS Tanks</span>
        </Link>
        <p className="mt-1 text-xs text-slate-400">Installation Verification System • Access Portal</p>
      </div>

      <Card className="w-full max-w-md border-white/10 z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle>Field Access</CardTitle>
          <CardDescription>
            {activeTab === "signin"
              ? "Sign in to access assigned installation jobs and review queues"
              : "Register as an installer, QC reviewer, or management user"}
          </CardDescription>

          <div className="pt-2">
            <Tabs
              tabs={[
                { id: "signin", label: "Sign In" },
                { id: "signup", label: "Register Account" },
              ]}
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setError(null);
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 rounded-lg bg-accent-rose/10 border border-accent-rose/20 p-3 text-xs text-accent-rose">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <Input
                label="Corporate or Field Email"
                type="email"
                placeholder="installer@sbstanks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-surface-100 text-accent-sky" />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Sign In to Verification Portal
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <Input
                label="Full Name"
                type="text"
                placeholder="Samuel Kiprop"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="s.kiprop@sbstanks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as SbsRole)}
                  className="w-full rounded-md border border-white/10 bg-surface-100 px-3 py-2 text-sm text-white focus:border-accent-sky focus:outline-none focus:ring-1 focus:ring-accent-sky"
                >
                  <option value="Lead Installer">Lead Installer (Field Lead & Submission)</option>
                  <option value="Installer">Installer (Field Capture & Issue Flagging)</option>
                  <option value="QC Reviewer">QC Reviewer (Engineering Verification & Approvals)</option>
                  <option value="Management">Management (Lifecycle & Handover Oversight)</option>
                </select>
              </div>
              <Input
                label="Create Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
                Create Account
              </Button>
            </form>
          )}

          {/* Role-Specific Prototype Testing Mode */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                Prototype Demo Roles
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo("Lead Installer")}
                className="text-xs border-accent-sky/20 hover:border-accent-sky/50 text-accent-sky"
              >
                Lead Installer
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo("QC Reviewer")}
                className="text-xs border-accent-emerald/20 hover:border-accent-emerald/50 text-accent-emerald"
              >
                QC Reviewer
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo("Installer")}
                className="text-xs border-white/10 hover:border-white/30 text-slate-300"
              >
                Installer
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo("Management")}
                className="text-xs border-white/10 hover:border-white/30 text-slate-300"
              >
                Management
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 text-center">
              Note: Unspoofable identity against backend Auth is enforced in Slice 0 per docs/identity-and-auth.md.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Return to Overview
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-slate-400 text-sm">
          Loading Verification Portal...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
