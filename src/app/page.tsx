import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Camera,
  Layers,
  ClipboardList,
  Lock,
  WifiOff,
  UserCheck,
  History,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-28 border-b border-white/5">
          {/* Subtle Ambient Lighting */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[750px] rounded-full bg-accent-sky/15 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/2 -right-40 h-[350px] w-[350px] rounded-full bg-accent-emerald/10 blur-[100px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Pill Banner */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-surface-100/80 px-4 py-1.5 text-xs text-slate-300 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-accent-sky animate-pulse" />
              <span className="font-semibold text-white">SBS Tanks Quality Assurance</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Remote Installation Verification System</span>
            </div>

            {/* Display Typography */}
            <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
              Attributable Quality Verification for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-sky via-sky-300 to-sky-400">
                Remote Tank Installations.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Connect field installation crews with central QC engineers before crew demobilization. Enforce
              requirement-level evidence, four-state completeness gates, and immutable audit trails.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth">
                <Button variant="primary" size="lg" className="space-x-2 shadow-lg shadow-accent-sky/10">
                  <span>Enter Verification Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="border-white/10">
                  <span>View Active Jobs</span>
                </Button>
              </Link>
            </div>

            {/* Trust and Governance Bar */}
            <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">QC Authority</p>
                <p className="text-sm font-semibold text-white mt-1">Human Engineering Sign-off</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Field Capture</p>
                <p className="text-sm font-semibold text-white mt-1">Offline-First & Idempotent</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Attribution</p>
                <p className="text-sm font-semibold text-white mt-1">Unspoofable Individual Identity</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Auditability</p>
                <p className="text-sm font-semibold text-white mt-1">Append-Only Event Log</p>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW LIFECYCLE SECTION */}
        <section id="workflow" className="py-20 border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3 border-accent-sky/30 text-accent-sky">
                Governed Process
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Six Stages from Job Creation to Handover
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                The verification workflow makes the correct installation process easier to follow and the incorrect
                process harder to hide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-white/10 bg-surface-100/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-sky/10 text-accent-sky mb-2">
                    <Layers className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">1. Job & Guideline Instantiation</CardTitle>
                  <CardDescription>
                    Jobs instantiate Stages and Requirements from the active SBS Guideline version, preserving exact
                    engineering templates.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-emerald/10 text-accent-emerald mb-2">
                    <Camera className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">2. Requirement-Linked Evidence</CardTitle>
                  <CardDescription>
                    Field installers capture photos, videos, and measurement-notes linked strictly to specific
                    Requirements, not vague job folders.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-sky/10 text-accent-sky mb-2">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">3. Completeness Gate</CardTitle>
                  <CardDescription>
                    Four distinct states (Missing Evidence, Unconvincing Evidence, Defective Work, N/A with reason).
                    Stage submission requires valid evidence.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-rose/10 text-accent-rose mb-2">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">4. Per-Requirement QC Review</CardTitle>
                  <CardDescription>
                    Human QC engineers inspect evidence chains. Rejections require mandatory categorized types and
                    clear technical instructions.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">5. Deficiency & Correction Loop</CardTitle>
                  <CardDescription>
                    Rejections and self-flagged issues follow an identical resolution loop: corrective action taken,
                    replacement evidence submitted, QC re-review.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-emerald/10 text-accent-emerald mb-2">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">6. Handover & Certificates</CardTitle>
                  <CardDescription>
                    Ready for Handover requires 100% requirements approved with zero open deficiencies. Practical
                    Completion recording captures open deficiency count at signing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* ROLE RESPONSIBILITIES */}
        <section id="roles" className="py-20 border-b border-white/5 bg-surface-50/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3 border-accent-emerald/30 text-accent-emerald">
                Access Control
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Four Distinct Operational Roles
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                Clear separation of concerns ensures integrity across field execution, technical oversight, and
                operational governance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-white/10 bg-surface-100/50 flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-slate-300">
                    Field Team
                  </Badge>
                  <CardTitle className="text-lg">Installer</CardTitle>
                  <CardDescription>
                    Captures offline-first evidence against assigned Requirements. Marks N/A with required justification.
                    Can use &quot;Flag an Issue&quot; at any time.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50 flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="default" className="w-fit mb-2 bg-accent-sky/20 text-accent-sky border-accent-sky/30">
                    Field Lead
                  </Badge>
                  <CardTitle className="text-lg">Lead Installer</CardTitle>
                  <CardDescription>
                    Coordinates requirement coverage, validates stage completeness gates, and submits completed Stages
                    for remote QC review.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50 flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="success" className="w-fit mb-2">
                    Engineering
                  </Badge>
                  <CardTitle className="text-lg">QC Reviewer</CardTitle>
                  <CardDescription>
                    Sole authority on engineering correctness. Inspects evidence history, approves or rejects
                    requirements, and validates corrective actions.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/10 bg-surface-100/50 flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-slate-300">
                    Executive
                  </Badge>
                  <CardTitle className="text-lg">Management</CardTitle>
                  <CardDescription>
                    Read-only operational visibility into Job lifecycles, open deficiency counts, and planned
                    demobilization timing across all sites.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* STANDARDS & ARCHITECTURAL BOUNDARIES */}
        <section id="standards" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-surface-100/60 p-8 sm:p-12 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-sky/20 text-accent-sky">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Governed Architecture Standards</h3>
                  <p className="text-xs text-slate-400">Strict boundaries frozen per docs/PRD.md</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-emerald shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Human QC Approval:</strong> Software organizes evidence and enforces
                    structural completeness, but never determines physical correctness. No automated AI approval.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-emerald shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Immutable Evidence Chain:</strong> Submitted evidence is never edited
                    or deleted. Replaced evidence is superseded, preserving the complete review history for QC.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-emerald shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Self-Flagged Issue Parity:</strong> &quot;Flag an Issue&quot; creates an identical
                    deficiency workflow to a QC rejection, encouraging proactive disclosure without installer blame.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-mono">SBS-IVS • Pilot Version 1.0.0</span>
                <Link href="/auth">
                  <Button variant="primary" size="sm" className="space-x-1.5">
                    <span>Access Verification Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
