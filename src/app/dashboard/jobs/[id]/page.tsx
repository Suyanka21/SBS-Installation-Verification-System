"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  PopulatedJob,
  PopulatedRequirement,
  EvidenceType,
  EvidenceItem,
} from "@/lib/installation/types";
import {
  getLocalQueue,
  enqueueEvidence,
  syncQueue,
  QueuedEvidenceItem,
} from "@/lib/evidence/offline-queue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  Camera,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  Upload,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  FileCheck,
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

  // Offline Sync State
  const [offlineQueue, setOfflineQueue] = useState<QueuedEvidenceItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [simulateOffline, setSimulateOffline] = useState(false);

  // Evidence Capture Modal State
  const [activeReqForCapture, setActiveReqForCapture] = useState<PopulatedRequirement | null>(null);
  const [captureType, setCaptureType] = useState<EvidenceType>("photo");
  const [measurementValue, setMeasurementValue] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supersedesId, setSupersedesId] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
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

      if (data.job?.stages) {
        setExpandedStages((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          const initial: Record<string, boolean> = {};
          data.job.stages.forEach((s: { stageId: string }, idx: number) => {
            initial[s.stageId] = idx === 0;
          });
          return initial;
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching installation job");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
    setOfflineQueue(getLocalQueue());
  }, [fetchJob]);

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

  // Trigger Offline Queue Synchronization
  const handleSyncQueue = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncQueue();
      setOfflineQueue(getLocalQueue());
      setSyncFeedback(
        `Synced ${result.syncedCount} item${result.syncedCount === 1 ? "" : "s"} successfully.`
      );
      await fetchJob();
    } catch (err: unknown) {
      setSyncFeedback(err instanceof Error ? err.message : "Sync encountered an error.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Evidence Capture Modal
  const openCaptureModal = (req: PopulatedRequirement, supersedesEvidenceId?: string) => {
    setActiveReqForCapture(req);
    const initialType = req.template.evidenceTypesAllowed[0] || "photo";
    setCaptureType(initialType);
    setMeasurementValue("");
    setMeasurementUnit(initialType === "measurement_note" ? "Nm" : "");
    setPhotoPreview(null);
    setFileName(null);
    setCaptureError(null);
    setSupersedesId(supersedesEvidenceId || null);
  };

  // Handle Photo File Pick
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Evidence (Online or Queued Offline)
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReqForCapture) return;

    if (captureType === "measurement_note" && !measurementValue.trim()) {
      setCaptureError("Measurement value is mandatory for measurement note evidence.");
      return;
    }

    setIsSubmitting(true);
    setCaptureError(null);

    // If simulating offline or navigator.onLine is false, queue locally
    if (simulateOffline || !navigator.onLine) {
      enqueueEvidence({
        requirementId: activeReqForCapture.requirementId,
        type: captureType,
        fileRef: photoPreview || null,
        fileName: fileName || `${captureType}_sample.jpg`,
        fileSize: photoPreview ? photoPreview.length : 1024,
        measurementValue: captureType === "measurement_note" ? measurementValue.trim() : null,
        measurementUnit: captureType === "measurement_note" ? measurementUnit.trim() : null,
        supersedesEvidenceId: supersedesId || null,
      });

      setOfflineQueue(getLocalQueue());
      setIsSubmitting(false);
      setActiveReqForCapture(null);
      setSyncFeedback("Evidence stored locally in offline queue. Sync when connectivity returns.");
      return;
    }

    // Direct Online Submission
    try {
      const clientUuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `cli_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const res = await fetch("/api/sbs/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientUuid,
          requirementId: activeReqForCapture.requirementId,
          type: captureType,
          fileRef: photoPreview || null,
          fileName: fileName || `${captureType}_capture.jpg`,
          fileSize: photoPreview ? photoPreview.length : 2048,
          measurementValue: captureType === "measurement_note" ? measurementValue.trim() : null,
          measurementUnit: captureType === "measurement_note" ? measurementUnit.trim() : null,
          supersedesEvidenceId: supersedesId || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with HTTP ${res.status}`);
      }

      setIsSubmitting(false);
      setActiveReqForCapture(null);
      await fetchJob();
    } catch (err: unknown) {
      setCaptureError(err instanceof Error ? err.message : "Error submitting evidence");
      setIsSubmitting(false);
    }
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

  const totalStages = job.stages.length;
  const totalRequirements = job.stages.reduce((acc, s) => acc + s.requirements.length, 0);
  const totalSubmittedEvidence = job.stages.reduce(
    (acc, s) => acc + s.requirements.reduce((rAcc, r) => rAcc + r.evidenceItems.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* TOP SUB-NAV */}
      <header className="border-b border-white/5 bg-surface-100/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All Jobs
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-accent-sky truncate max-w-[150px] sm:max-w-none">
              {job.jobId}
            </span>
          </div>

          {/* OFFLINE SYNC CONTROLS */}
          <div className="flex items-center space-x-3">
            {/* Offline Simulation Toggle */}
            <button
              onClick={() => setSimulateOffline(!simulateOffline)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
                simulateOffline
                  ? "bg-amber-400/10 border-amber-400/40 text-amber-300"
                  : "bg-surface-200 border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              {simulateOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
              <span>{simulateOffline ? "Offline Sim: ON" : "Online Mode"}</span>
            </button>

            {/* Offline Queue Badge & Sync Button */}
            {offlineQueue.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSyncQueue}
                disabled={isSyncing || simulateOffline}
                className="space-x-1.5 bg-amber-500 hover:bg-amber-600 text-background text-xs py-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync Queue ({offlineQueue.length})</span>
              </Button>
            )}

            <Badge variant="outline" className="border-accent-sky/30 text-accent-sky text-xs">
              Guideline v{job.guideline.versionNumber}.0
            </Badge>
          </div>
        </div>

        {/* Sync Feedback Toast Banner */}
        {syncFeedback && (
          <div className="bg-surface-200/90 border-t border-white/5 px-4 py-1.5 text-center text-xs text-slate-300 flex items-center justify-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-sky" />
            <span>{syncFeedback}</span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-slate-500 hover:text-slate-300 ml-2"
            >
              ×
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* CRITICAL PRODUCT BOUNDARY NOTICE (docs/evidence-and-offline.md §1) */}
        <div className="rounded-lg border border-accent-sky/20 bg-surface-100/60 p-4 text-xs text-slate-300 space-y-1">
          <div className="flex items-center space-x-2 font-semibold text-accent-sky">
            <ShieldCheck className="h-4 w-4" />
            <span>Evidence Capture Governance (PRD §9 & Technical Constraint)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Photographs and measurement notes collect evidence for human QC engineering inspection. The
            system does not claim photographs establish structural levelness, true bolt torque, or material
            performance. Submitted evidence moves to &quot;Pending Review&quot; — never auto-approved.
          </p>
        </div>

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
                    <span>Demob Target: {job.plannedDemobilizationDate}</span>
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
              <div className="text-center px-3 border-r border-white/5">
                <p className="text-xs text-slate-400 font-mono">REQUIREMENTS</p>
                <p className="text-xl font-bold text-white mt-0.5">{totalRequirements}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-xs text-slate-400 font-mono">EVIDENCE ITEMS</p>
                <p className="text-xl font-bold text-accent-sky mt-0.5">
                  {totalSubmittedEvidence}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>
              Bound Guideline: <strong className="text-slate-200">{job.guideline.title}</strong>
            </span>
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

        {/* STAGES & REQUIREMENTS CHECKLIST WITH EVIDENCE CAPTURE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Installation Checklist & Requirement-Linked Evidence
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Slice 2 — Evidence Capture Active
            </span>
          </div>

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
                          {stage.requirements.length} requirements • Stage Status:{" "}
                          <span className="text-slate-200">{stage.status}</span>
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

                  {/* REQUIREMENTS LIST */}
                  {isExpanded && (
                    <div className="border-t border-white/5 divide-y divide-white/5 bg-background/50 px-2 sm:px-4 py-2">
                      {stage.requirements.map((req, rIdx) => {
                        const queuedForReq = offlineQueue.filter(
                          (q) => q.requirementId === req.requirementId
                        );

                        return (
                          <div
                            key={req.requirementId}
                            className="py-4 px-3 sm:px-4 hover:bg-surface-100/30 rounded-md transition-colors space-y-3"
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

                              {/* Requirement Status & Action Button */}
                              <div className="flex items-center gap-2 pl-5 sm:pl-0 shrink-0">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    req.status === "Evidence Submitted"
                                      ? "border-accent-sky/40 text-accent-sky bg-accent-sky/10"
                                      : "border-slate-700 text-slate-400"
                                  }`}
                                >
                                  {req.status}
                                </Badge>

                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openCaptureModal(req)}
                                  className="text-xs space-x-1 py-1"
                                >
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>Attach Evidence</span>
                                </Button>
                              </div>
                            </div>

                            {/* SUBMITTED EVIDENCE HISTORY LIST */}
                            {req.evidenceItems.length > 0 && (
                              <div className="pl-5 pt-2 space-y-2">
                                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                  Submitted Evidence ({req.evidenceItems.length}):
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {req.evidenceItems.map((ev) => (
                                    <div
                                      key={ev.evidenceId}
                                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                                        ev.status === "Superseded"
                                          ? "border-white/5 bg-surface-200/20 opacity-60"
                                          : "border-white/10 bg-surface-200/60"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] uppercase font-mono border-white/10"
                                        >
                                          {ev.type.replace("_", " ")}
                                        </Badge>
                                        <Badge
                                          variant="outline"
                                          className={
                                            ev.status === "Pending Review"
                                              ? "border-amber-400/40 text-amber-300 bg-amber-400/5 text-[10px]"
                                              : ev.status === "Superseded"
                                              ? "border-slate-600 text-slate-500 text-[10px]"
                                              : "border-accent-emerald/40 text-accent-emerald text-[10px]"
                                          }
                                        >
                                          {ev.status === "Pending Review"
                                            ? "Pending Human QC"
                                            : ev.status}
                                        </Badge>
                                      </div>

                                      {/* Measurement Value if note */}
                                      {ev.type === "measurement_note" && (
                                        <p className="font-mono text-sm text-accent-sky font-semibold">
                                          Reading: {ev.measurementValue} {ev.measurementUnit}
                                        </p>
                                      )}

                                      {/* File thumbnail / preview if image */}
                                      {ev.fileRef && (
                                        <div className="mt-1 h-20 w-full rounded overflow-hidden bg-black/40 border border-white/5 relative">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={ev.fileRef}
                                            alt={ev.fileName || "Evidence photo"}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                      )}

                                      <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-white/5">
                                        <p>
                                          By:{" "}
                                          <span className="text-slate-200 font-medium">
                                            {ev.submittedByName || "Installer"}
                                          </span>
                                        </p>
                                        <p className="font-mono text-[10px] text-slate-500">
                                          Synced: {new Date(ev.submittedAt).toLocaleTimeString()},{" "}
                                          {new Date(ev.submittedAt).toLocaleDateString()}
                                        </p>
                                        {ev.supersedesEvidenceId && (
                                          <p className="text-amber-400/80 font-mono text-[10px]">
                                            Supersedes prior item
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* OFFLINE QUEUED ITEMS FOR THIS REQUIREMENT */}
                            {queuedForReq.length > 0 && (
                              <div className="pl-5 pt-2">
                                <div className="p-2 rounded border border-amber-400/30 bg-amber-400/5 text-xs text-amber-300 space-y-1">
                                  <div className="flex items-center space-x-1.5 font-medium">
                                    <WifiOff className="h-3.5 w-3.5" />
                                    <span>
                                      {queuedForReq.length} item(s) captured offline (pending sync)
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400">
                                    Persisted locally on device. Will synchronize when online.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* EVIDENCE CAPTURE MODAL */}
      {activeReqForCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-surface-100 p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky/15 text-accent-sky">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Capture Installation Evidence</h3>
                  <p className="text-xs text-slate-400">
                    Linked to: {activeReqForCapture.template.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveReqForCapture(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {captureError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{captureError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              {/* Evidence Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Evidence Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {activeReqForCapture.template.evidenceTypesAllowed.map((et) => (
                    <button
                      key={et}
                      type="button"
                      onClick={() => setCaptureType(et)}
                      className={`p-2 rounded-lg border text-xs font-medium capitalize flex items-center space-x-2 transition-colors ${
                        captureType === et
                          ? "border-accent-sky bg-accent-sky/10 text-accent-sky"
                          : "border-white/10 bg-surface-200 text-slate-300 hover:bg-surface-200/80"
                      }`}
                    >
                      {et === "measurement_note" ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <span>{et.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo / Document Upload Input */}
              {(captureType === "photo" ||
                captureType === "video" ||
                captureType === "document") && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    File Attachment (Camera or Local File) *
                  </label>
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-accent-sky/40 transition-colors">
                    <input
                      type="file"
                      accept={captureType === "photo" ? "image/*" : "*/*"}
                      onChange={handleFileChange}
                      className="hidden"
                      id="evidence-file-input"
                    />
                    <label
                      htmlFor="evidence-file-input"
                      className="cursor-pointer flex flex-col items-center space-y-1"
                    >
                      <Upload className="h-6 w-6 text-accent-sky" />
                      <span className="text-xs font-medium text-slate-200">
                        {fileName ? fileName : "Tap to capture or select file"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PNG, JPEG, MP4, or PDF up to 10MB
                      </span>
                    </label>
                  </div>

                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="h-32 w-full rounded-lg overflow-hidden border border-white/10 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Capture preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Measurement Note Inputs */}
              {captureType === "measurement_note" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Reading Value *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. 75"
                      value={measurementValue}
                      onChange={(e) => setMeasurementValue(e.target.value)}
                      required
                      className="bg-surface-200 border-white/10 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Measurement Unit
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Nm, mm, %"
                      value={measurementUnit}
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="bg-surface-200 border-white/10 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Attribution and Human QC Inspection Notice */}
              <div className="rounded-lg bg-surface-200/50 p-3 text-[11px] text-slate-400 space-y-1 border border-white/5">
                <p>
                  Submitting as:{" "}
                  <strong className="text-slate-200">{user?.name}</strong> ({user?.role})
                </p>
                <p>
                  Status upon submission:{" "}
                  <strong className="text-amber-400">Pending Review</strong>. Requires human QC
                  inspection before requirement approval.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveReqForCapture(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>{simulateOffline ? "Queue Offline" : "Submit Evidence"}</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
