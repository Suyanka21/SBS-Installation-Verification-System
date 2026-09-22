"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, User as UserIcon, ArrowRight, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const { signIn, signUp, signInDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    } catch {
      setError("Failed to sign in. Please verify credentials.");
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
      await signUp(name, email, password);
      router.push("/dashboard");
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    signInDemo();
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      {/* Ambient background blur */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-accent-sky/10 blur-3xl" />

      {/* Brand logo header */}
      <div className="mb-6 text-center z-10">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-sky text-black font-extrabold text-lg shadow-sm">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Suyanka App</span>
        </Link>
        <p className="mt-1 text-xs text-slate-400">Authentication & Access Portal</p>
      </div>

      <Card className="w-full max-w-md border-white/10 z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            {activeTab === "signin"
              ? "Sign in to access your dashboard and active projects"
              : "Create a new developer account in seconds"}
          </CardDescription>

          <div className="pt-2">
            <Tabs
              tabs={[
                { id: "signin", label: "Sign In" },
                { id: "signup", label: "Create Account" },
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
                label="Email Address"
                type="email"
                placeholder="developer@suyanka.app"
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
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your email when Supabase/Firebase is connected.")}
                  className="text-accent-sky hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Sign In to Dashboard
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="developer@suyanka.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
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
                Create Free Account
              </Button>
            </form>
          )}

          {/* Quick Demo Bypass Button */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                Prototype Testing Mode
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleQuickDemo}
              className="w-full border-accent-sky/20 hover:border-accent-sky/50 text-accent-sky text-xs flex items-center justify-center space-x-2"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Instant Demo Pass-Through (Bypass Auth)</span>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500">
          <p>
            Pluggable with Supabase Auth or Firebase Authentication. Defined in{" "}
            <code className="text-slate-400 font-mono">src/lib/auth/</code>
          </p>
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Return to Landing Page
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
