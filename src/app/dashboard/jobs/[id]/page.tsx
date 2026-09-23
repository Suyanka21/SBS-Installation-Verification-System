"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PopulatedJob } from "@/lib/installation/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Camera,
  FileText,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<PopulatedJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/sbs/jobs/${jobId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load job (HTTP ${res.status})`);
        }
        const data = await res.json();
        setJob(data.job);

        // Expand all stages by default for easy checklist scanning
        if (data.job?.stages) {
          const initialExpanded: Record<string, boolean> = {};
          data.job.stages.forEach((s: { stageId: string }, idx: number) => {
            initialExpanded[s.stageId] = idx === 0; // expand first stage initially
          });
          setExpandedStages(initialExpanded);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching installation job");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  const expandAll = () => {
    if (!job) return;
    const allExpanded: Record<string, boolean> = {};
    job.stages.forEach((s) => {
      allExpanded[s.stageId] = true;
    });
    setExpandedStages(allExpanded);
  };

  const collapseAll = () => {
    setExpandedStages({});
  };

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-24 bg-surface-100 animate-pulse rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-surface-100 animate-pulse rounded-lg border border-white/5" />
          <div className="h-16 bg-surface-100 animate-pulse rounded-lg border border-white/5" />
          <div className="h-48 bg-surface-100 animate-pulse rounded-lg border border-white/5" />
          <div className="h-48 bg-surface-100 animate-pulse rounded-lg border border-white/5" />
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error || !job) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-rose-500/20 bg-surface-100/90 text-center p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl text-white">Job Unavailable</CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            {error || "The requested installation job structure could not be retrieved."}
          </CardDescription>
          <div className="mt-6 flex justify-center space-x-3">
            <Button variant="secondary" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const totalStages = job.stages.length;
  const totalRequirements = job.stages.reduce((acc, s) => acc + s.requirements.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* TOP SUB-NAV */}
      <header className="border-b border-white/5 bg-surface-100/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All Jobs
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-accent-sky truncate max-w-[200px] sm:max-w-none">
              {job.jobId}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-accent-sky/30 text-accent-sky text-xs">
              Guideline v{job.guideline.versionNumber}.0
            </Badge>
            <Badge
              variant="outline"
              className={
                job.status === "In Progress"
                  ? "border-amber-400/30 text-amber-400 bg-amber-400/5 text-xs"
                  : "border-slate-500 text-slate-400 text-xs"
              }
            >
              {job.status}
            </Badge>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* JOB SUMMARY BANNER */}
        <section className="rounded-xl border border-white/10 bg-surface-100/60 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-sky/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                <Building className="h-3.5 w-3.5 text-accent-sky" />
                <span>Installation Site</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {job.siteName}
              </h1>
              <p className="mt-1 text-sm text-slate-300 font-medium">{job.tankModel}</p>

              <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.plannedDemobilizationDate && (
                  <div className="flex items-center space-x-1.5 text-amber-400/90">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Demobilization Target: {job.plannedDemobilizationDate}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                  <span>Created by: {job.createdByName || "Lead Installer"}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-surface-200/60 p-4 rounded-lg border border-white/5">
              <div className="text-center px-3 border-r border-white/5">
                <p className="text-xs text-slate-400 font-mono">STAGES</p>
                <p className="text-xl font-bold text-white mt-0.5">{totalStages}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-xs text-slate-400 font-mono">REQUIREMENTS</p>
                <p className="text-xl font-bold text-accent-sky mt-0.5">{totalRequirements}</p>
              </div>
            </div>
          </div>

          {/* Bound Guideline Immuntability Note */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-accent-emerald" />
              <span>
                Bound to{" "}
                <strong className="text-slate-200">{job.guideline.title}</strong> (v
                {job.guideline.versionNumber}.0) — Stages and requirements are permanently frozen to this version.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={expandAll}
                className="text-accent-sky hover:underline font-mono text-[11px]"
              >
                Expand All
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={collapseAll}
                className="text-slate-400 hover:text-white font-mono text-[11px]"
              >
                Collapse All
              </button>
            </div>
          </div>
        </section>

        {/* INSTALLER'S UNPOPULATED CHECKLIST VIEW */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Installation Stages & Requirements Checklist
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Unpopulated verification checklist instantiated from official engineering guideline.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Slice 1 — Core Installation Structure
            </span>
          </div>

          {/* STAGES LIST */}
          <div className="space-y-4">
            {job.stages.map((stage) => {
              const isExpanded = !!expandedStages[stage.stageId];
              return (
                <div
                  key={stage.stageId}
                  className="rounded-lg border border-white/10 bg-surface-100/70 overflow-hidden transition-all duration-200"
                >
                  {/* STAGE HEADER ACCORDION */}
                  <button
                    onClick={() => toggleStage(stage.stageId)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-200/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-200 border border-white/10 text-xs font-mono text-slate-300">
                        {stage.template.sequenceOrder}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-white">
                          {stage.template.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {stage.requirements.length} requirement
                          {stage.requirements.length === 1 ? "" : "s"} under this stage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className="border-slate-700 bg-surface-200/40 text-slate-300 text-[11px]"
                      >
                        {stage.status}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* REQUIREMENTS CHECKLIST TABLE / ITEMS */}
                  {isExpanded && (
                    <div className="border-t border-white/5 divide-y divide-white/5 bg-background/50 px-2 sm:px-4 py-2">
                      {stage.requirements.map((req, rIdx) => (
                        <div
                          key={req.requirementId}
                          className="py-3 px-3 sm:px-4 hover:bg-surface-100/40 rounded-md transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs text-slate-500">
                                  {stage.template.sequenceOrder}.{rIdx + 1}
                                </span>
                                <h4 className="text-sm font-medium text-slate-100">
                                  {req.template.title}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-400 pl-5 leading-relaxed max-w-2xl">
                                {req.template.description}
                              </p>
                            </div>

                            {/* Requirement Metadata Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pl-5 sm:pl-0 shrink-0">
                              {req.template.evidenceTypesAllowed.map((et) => (
                                <Badge
                                  key={et}
                                  variant="outline"
                                  className="text-[10px] font-mono border-white/10 text-slate-300 bg-surface-200/30 capitalize"
                                >
                                  {et.replace("_", " ")}
                                </Badge>
                              ))}

                              {req.template.allowsNa && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  [N/A allowed]
                                </span>
                              )}

                              <Badge
                                variant="outline"
                                className="text-[10px] border-slate-700 bg-surface-200/40 text-slate-400 ml-1"
                              >
                                {req.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* WORKFLOW PHASE CALLOUT */}
        <section className="rounded-lg border border-accent-sky/20 bg-accent-sky/5 p-4 flex items-start space-x-3 text-xs text-slate-300">
          <Layers className="h-5 w-5 text-accent-sky shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Slice 1 Installation Domain Active</p>
            <p className="text-slate-400 leading-relaxed">
              This job structure was instantiated atomically from SBS Guideline v
              {job.guideline.versionNumber}.0. In Slice 2, installers will attach timestamped,
              immutable photo and measurement evidence against each specific requirement.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
