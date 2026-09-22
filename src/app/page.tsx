import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Database,
  FileCode2,
  Terminal,
  Cpu,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-white/5">
          {/* Ambient Lighting */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent-sky/15 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-accent-rose/10 blur-[100px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Pill Banner */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-surface-100/80 px-3.5 py-1 text-xs text-slate-300 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="font-medium text-white">Suyanka App Template</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">27 Autonomous Agent Skills Pre-Loaded</span>
            </div>

            {/* Display Typography */}
            <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              The Full-Stack Foundation Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-sky via-sky-300 to-sky-500">
                Agent-First
              </span>{" "}
              Engineering.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Equipped with permanent reasoning protocols, defensive CodeRabbit rigor, and anti-AI design systems.
              Includes Splash, Auth, Landing, Dashboard, and Supabase/Firebase Drizzle ORM.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth">
                <Button variant="primary" size="lg" className="space-x-2">
                  <span>Launch Live App</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/splash">
                <Button variant="secondary" size="lg" className="space-x-2">
                  <Sparkles className="h-4 w-4 text-accent-sky" />
                  <span>Preview Splash Screen</span>
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Dashboard Shell
                </Button>
              </Link>
            </div>

            {/* Terminal snippet card */}
            <div className="mt-14 mx-auto max-w-2xl rounded-xl border border-white/10 bg-surface-50/80 p-4 text-left shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-500">Terminal Setup</span>
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-300 space-y-1">
                <p className="text-slate-500"># 1. Clone this template repository</p>
                <p className="text-accent-sky">git clone https://github.com/Suyanka21/agent-skills-starter-template.git my-app</p>
                <p className="text-slate-500 pt-1"># 2. Tell any coding agent (Claude Code, Cursor, Antigravity, Kilo):</p>
                <p className="text-emerald-400">&quot;Read docs/PRD.md and implement the next feature using .agents/skills&quot;</p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE ARCHITECTURE PILLARS */}
        <section id="features" className="py-20 border-b border-white/5 bg-surface-50/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3">Engineered for Reliability</Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Not Just a Template. An Agent Operating System.
              </h2>
              <p className="mt-3 text-slate-400 text-sm">
                Every file in this project is anchored to authoritative documentation in <code className="text-accent-sky font-mono">docs/</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-accent-sky/10 border border-accent-sky/20 flex items-center justify-center text-accent-sky mb-2">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <CardTitle>27 Modular Agent Skills</CardTitle>
                  <CardDescription>
                    Progressive disclosure via YAML headers in <code className="text-slate-300 font-mono">.agents/skills/</code>.
                    Includes anti-ai-design, coderabbit-dna, and global-reasoning-layer.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald mb-2">
                    <Database className="h-5 w-5" />
                  </div>
                  <CardTitle>Dual Backend Ready</CardTitle>
                  <CardDescription>
                    Includes typed schemas and clients for both <strong>Supabase + Drizzle ORM</strong> and <strong>Firebase</strong>.
                    Toggle with a single environment variable.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center text-accent-rose mb-2">
                    <Layers className="h-5 w-5" />
                  </div>
                  <CardTitle>Anti-AI Design System</CardTitle>
                  <CardDescription>
                    Rejects generic SaaS cards and purple glow. Delivers bespoke contrast, editorial typography,
                    and resilient 4-UX state handling on every surface.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* 27 AGENT SKILLS REGISTRY OVERVIEW */}
        <section id="skills" className="py-20 border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="outline" className="mb-2">Automated Discovery</Badge>
                <h2 className="text-3xl font-bold text-white tracking-tight">Active Skills Registry</h2>
                <p className="mt-2 text-slate-400 text-sm">
                  Loaded progressively by Claude Code, Cursor, Antigravity, and Kilo Code.
                </p>
              </div>
              <Link href="/auth">
                <Button variant="secondary" size="sm" className="space-x-1.5">
                  <span>Test in Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {[
                { name: "global-reasoning-layer", desc: "Permanent foundation: How the agent thinks." },
                { name: "coderabbit-dna", desc: "Defensive engineering applied to every line." },
                { name: "anti-ai-design", desc: "Mandatory UI engine with 19 reference guides." },
                { name: "using-agent-skills", desc: "Master orchestrator and lifecycle sequencing." },
                { name: "spec-driven-development", desc: "Define falsifiable specs before writing code." },
                { name: "test-driven-development", desc: "Failing tests first before implementation." },
                { name: "security-and-hardening", desc: "Boundary validation, auth, and least privilege." },
                { name: "trustless-system-auditor", desc: "Reality-gap pre-launch verification." },
              ].map((skill) => (
                <div
                  key={skill.name}
                  className="rounded-lg border border-white/10 bg-surface-50 p-4 hover:border-accent-sky/40 transition-colors"
                >
                  <p className="font-mono text-accent-sky font-semibold">{skill.name}</p>
                  <p className="mt-1 text-slate-400">{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOCS DRIVEN DEVELOPMENT CALLOUT */}
        <section id="docs" className="py-20 bg-gradient-to-b from-transparent to-surface-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Ready to Build Your Next Product?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-slate-400 text-sm">
              Use this starter template to launch apps in hours rather than weeks. Modify <code className="text-accent-sky font-mono">docs/PRD.md</code> and let your agent do the heavy lifting.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/auth">
                <Button variant="primary" size="md">
                  Get Started with Suyanka
                </Button>
              </Link>
              <a
                href="https://github.com/Suyanka21/agent-skills-starter-template"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="md" className="space-x-2">
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
