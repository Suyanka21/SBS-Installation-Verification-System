"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, SbsRole } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Layers,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  LogOut,
  Calendar,
  Building,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  PlusCircle,
  X,
  AlertCircle,
} from "lucide-react";

interface JobSummaryItem {
  jobId: string;
  siteName: string;
  tankModel: string;
  status: string;
  createdBy: string;
  createdByName?: string;
  guidelineVersion: number;
  totalStages: number;
  totalRequirements: number;
  plannedDemobilizationDate: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut, signInDemo } = useAuth();

  const [jobs, setJobs] = useState<JobSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Job Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [siteNameInput, setSiteNameInput] = useState("");
  const [tankModelInput, setTankModelInput] = useState("");
  const [demobDateInput, setDemobDateInput] = useState("");

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sbs/jobs");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load jobs");
      }
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading installation jobs");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteNameInput.trim() || !tankModelInput.trim()) {
      setModalError("Please provide both site name and tank model.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch("/api/sbs/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: siteNameInput.trim(),
          tankModel: tankModelInput.trim(),
          plannedDemobilizationDate: demobDateInput || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Creation failed with status ${res.status}`);
      }

      const data = await res.json();
      setIsModalOpen(false);
      setSiteNameInput("");
      setTankModelInput("");
      setDemobDateInput("");
      await fetchJobs();

      // Navigate directly into newly instantiated job
      if (data.job?.jobId) {
        router.push(`/dashboard/jobs/${data.job.jobId}`);
      }
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Error creating installation job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSwitch = async (role: SbsRole) => {
    await signInDemo(role);
    await fetchJobs();
  };

  const isAuthorizedToCreate =
    user?.role === "Lead Installer" || user?.role === "Management";

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tankModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : job.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* TOP NAVIGATION / WORKSPACE HEADER */}
      <header className="border-b border-white/5 bg-surface-100/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-sky/15 text-accent-sky border border-accent-sky/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  SBS TANKS
                </span>
                <span className="text-[10px] text-slate-400 font-mono block -mt-1">
                  INSTALLATION VERIFICATION
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-white/10 mx-2" />
            <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
              Slice 1 — Installation Domain
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Active User Card & Role Switcher */}
            <div className="flex items-center space-x-2 bg-surface-200/80 px-3 py-1.5 rounded-lg border border-white/5">
              <div className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">
                  {user?.name || "Authenticating..."}
                </p>
                <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                  {user?.role || "Field Agent"}
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-accent-sky/30 text-accent-sky ml-1"
              >
                {user?.role}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="border-white/10 text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* DEMO FAST-ROLE SWITCHER BAR */}
        <div className="border-t border-white/5 bg-surface-50/50 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px] shrink-0 mr-3">
              Switch Perspective:
            </span>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleRoleSwitch("Lead Installer")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  user?.role === "Lead Installer"
                    ? "bg-accent-sky/20 text-accent-sky border border-accent-sky/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-200"
                }`}
              >
                Lead Installer (Can Create Jobs)
              </button>
              <button
                onClick={() => handleRoleSwitch("Installer")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  user?.role === "Installer"
                    ? "bg-accent-sky/20 text-accent-sky border border-accent-sky/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-200"
                }`}
              >
                Installer (View Checklist)
              </button>
              <button
                onClick={() => handleRoleSwitch("QC Reviewer")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  user?.role === "QC Reviewer"
                    ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-200"
                }`}
              >
                QC Reviewer
              </button>
              <button
                onClick={() => handleRoleSwitch("Management")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  user?.role === "Management"
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-200"
                }`}
              >
                Management
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Installation Jobs Directory
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Active water tank verification projects instantiated from official SBS engineering guidelines.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthorizedToCreate ? (
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="shadow-lg shadow-accent-sky/10 space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>New Installation Job</span>
              </Button>
            ) : (
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-500 block">
                  Role: {user?.role}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  (Job creation requires Lead Installer or Management)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* GUIDELINE ANNOUNCEMENT BANNER */}
        <div className="rounded-lg border border-accent-sky/20 bg-surface-100/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky/15 text-accent-sky">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Active Guideline: SBS Kenya Standard Tank Installation Guideline v1.0
              </p>
              <p className="text-slate-400">
                New jobs automatically instantiate 6 verified installation stages (Anchorage, Shell, Liner, etc.) and all engineering requirement templates.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-accent-emerald/40 text-accent-emerald shrink-0">
            Published & Immutable
          </Badge>
        </div>

        {/* CONTROLS: SEARCH & STATUS FILTER */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by site location, tank model, or Job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface-100 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <Button
              variant={statusFilter === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-xs"
            >
              All Jobs
            </Button>
            <Button
              variant={statusFilter === "not started" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("not started")}
              className="text-xs"
            >
              Not Started
            </Button>
            <Button
              variant={statusFilter === "in progress" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("in progress")}
              className="text-xs"
            >
              In Progress
            </Button>
          </div>
        </div>

        {/* 1. LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl border border-white/5 bg-surface-100/50 animate-pulse p-6"
              />
            ))}
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!isLoading && error && (
          <Card className="border-rose-500/20 bg-surface-100/80 p-8 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg text-white">Error Loading Jobs</CardTitle>
            <CardDescription className="text-slate-400 mt-2">{error}</CardDescription>
            <Button variant="secondary" onClick={fetchJobs} className="mt-4">
              Retry
            </Button>
          </Card>
        )}

        {/* 3. EMPTY STATE */}
        {!isLoading && !error && filteredJobs.length === 0 && (
          <Card className="border-white/10 bg-surface-100/60 p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-200 text-slate-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg text-white">No Installation Jobs Found</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              {searchQuery || statusFilter !== "all"
                ? "No installation jobs match your current search and filter criteria."
                : "No installation jobs have been instantiated yet."}
            </CardDescription>
            {isAuthorizedToCreate && (
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="mt-6 space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Instantiate First Job</span>
              </Button>
            )}
          </Card>
        )}

        {/* 4. SUCCESS / POPULATED JOBS GRID */}
        {!isLoading && !error && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card
                key={job.jobId}
                className="border-white/10 bg-surface-100/70 hover:border-accent-sky/30 transition-all duration-200 flex flex-col justify-between group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="border-accent-sky/30 text-accent-sky text-[10px] font-mono"
                    >
                      Guideline v{job.guidelineVersion}.0
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        job.status === "In Progress"
                          ? "border-amber-400/30 text-amber-400 bg-amber-400/5 text-[10px]"
                          : "border-slate-600 text-slate-300 text-[10px]"
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg text-white mt-2 group-hover:text-accent-sky transition-colors">
                    {job.siteName}
                  </CardTitle>
                  <CardDescription className="text-slate-300 font-medium text-xs">
                    {job.tankModel}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-200/50 border border-white/5 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono">STAGES</p>
                      <p className="text-base font-bold text-white mt-0.5">{job.totalStages}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono">REQUIREMENTS</p>
                      <p className="text-base font-bold text-accent-sky mt-0.5">
                        {job.totalRequirements}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    {job.plannedDemobilizationDate && (
                      <div className="flex items-center space-x-1.5 text-amber-400/80">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Demobilization: {job.plannedDemobilizationDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <Link href={`/dashboard/jobs/${job.jobId}`} className="w-full block">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-between group-hover:bg-accent-sky group-hover:text-background transition-all"
                      >
                        <span>View Stages & Checklist</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* CREATE JOB MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-surface-100 p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky/15 text-accent-sky">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Create Installation Job</h3>
                  <p className="text-xs text-slate-400">Instantiate from Active Guideline v1.0</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Site Name / Location *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Athi River Industrial Facility"
                  value={siteNameInput}
                  onChange={(e) => setSiteNameInput(e.target.value)}
                  required
                  className="bg-surface-200 border-white/10 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tank Specification & Capacity *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. SBS Cyclonic 500kL (Fire Suppression)"
                  value={tankModelInput}
                  onChange={(e) => setTankModelInput(e.target.value)}
                  required
                  className="bg-surface-200 border-white/10 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Planned Demobilization Target Date (Optional)
                </label>
                <Input
                  type="date"
                  value={demobDateInput}
                  onChange={(e) => setDemobDateInput(e.target.value)}
                  className="bg-surface-200 border-white/10 text-white"
                />
                <p className="text-[11px] text-slate-500">
                  Drives pre-demobilization unresolved deficiency alerts.
                </p>
              </div>

              {/* Informative Instantiation Callout */}
              <div className="rounded-lg border border-accent-sky/20 bg-accent-sky/5 p-3 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-accent-sky">Atomic Instantiation Notice</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Upon creation, all 6 installation stages and their requirement templates from Published Guideline v1.0 will be instantiated with status &quot;Not Started&quot;.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
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
                    <span>Instantiating...</span>
                  ) : (
                    <>
                      <span>Create & Instantiate Job</span>
                      <ArrowRight className="h-4 w-4" />
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
