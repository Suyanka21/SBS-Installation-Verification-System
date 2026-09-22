"use client";

import React, { useState } from "react";
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
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

interface InstallationJobSummary {
  id: string;
  siteName: string;
  tankModel: string;
  status:
    | "Not Started"
    | "In Progress"
    | "Submitted for Review"
    | "Has Open Deficiencies"
    | "Ready for Handover"
    | "Closed";
  assignedLead: string;
  totalStages: number;
  completedStages: number;
  openDeficiencies: number;
  plannedDemobilizationDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut, signInDemo } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Representative SBS Installation Jobs for Foundation Shell
  const [jobsList] = useState<InstallationJobSummary[]>([
    {
      id: "job-001",
      siteName: "Naivasha Horticultural Processing Plant",
      tankModel: "SBS Cyclonic 250kL (Potable Water)",
      status: "In Progress",
      assignedLead: "Samuel Kiprop",
      totalStages: 6,
      completedStages: 3,
      openDeficiencies: 1,
      plannedDemobilizationDate: "2026-09-28",
    },
    {
      id: "job-002",
      siteName: "Eldoret Agro-Industrial Park",
      tankModel: "SBS Standard 100kL (Fire Protection)",
      status: "Submitted for Review",
      assignedLead: "Samuel Kiprop",
      totalStages: 5,
      completedStages: 4,
      openDeficiencies: 0,
      plannedDemobilizationDate: "2026-09-30",
    },
    {
      id: "job-003",
      siteName: "Kilifi Coastal Community Water Depot",
      tankModel: "SBS Elevated 50kL (Gravity Feed)",
      status: "Ready for Handover",
      assignedLead: "John Mwangi",
      totalStages: 5,
      completedStages: 5,
      openDeficiencies: 0,
      plannedDemobilizationDate: "2026-09-24",
    },
  ]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-white/10 text-center p-6 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-sky/20 text-accent-sky mx-auto font-black text-xl">
            SBS
          </div>
          <CardTitle>Session Required</CardTitle>
          <CardDescription>
            You must be signed in with an authorized operational role to access the SBS Installation Verification System.
          </CardDescription>
          <div className="pt-2">
            <Link href="/auth">
              <Button variant="primary" className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const filteredJobs = jobsList.filter((job) => {
    const matchesSearch =
      job.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tankModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.assignedLead.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "in_progress") return matchesSearch && job.status === "In Progress";
    if (statusFilter === "review") return matchesSearch && job.status === "Submitted for Review";
    if (statusFilter === "deficiencies") return matchesSearch && job.openDeficiencies > 0;
    if (statusFilter === "handover") return matchesSearch && job.status === "Ready for Handover";
    return matchesSearch;
  });

  const getRoleBadgeVariant = (role: SbsRole) => {
    switch (role) {
      case "QC Reviewer":
        return "success";
      case "Lead Installer":
        return "default";
      case "Installer":
        return "outline";
      case "Management":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Application Bar */}
      <header className="border-b border-white/10 bg-surface-50/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky text-black font-extrabold text-sm">
                SBS
              </div>
              <span className="font-bold text-white tracking-tight hidden sm:inline">Verification Portal</span>
            </Link>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {user.role}
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher for prototype testing */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-surface-100/80 px-2 py-1 rounded-md border border-white/5 text-[11px] text-slate-400">
              <span className="font-mono">Switch Role:</span>
              <button
                type="button"
                onClick={async () => {
                  await signInDemo("Lead Installer");
                  router.refresh();
                }}
                className={`px-1.5 py-0.5 rounded hover:text-white ${
                  user.role === "Lead Installer" ? "text-accent-sky font-semibold" : ""
                }`}
              >
                Lead
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signInDemo("QC Reviewer");
                  router.refresh();
                }}
                className={`px-1.5 py-0.5 rounded hover:text-white ${
                  user.role === "QC Reviewer" ? "text-accent-emerald font-semibold" : ""
                }`}
              >
                QC
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signInDemo("Installer");
                  router.refresh();
                }}
                className={`px-1.5 py-0.5 rounded hover:text-white ${
                  user.role === "Installer" ? "text-slate-200 font-semibold" : ""
                }`}
              >
                Installer
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signInDemo("Management");
                  router.refresh();
                }}
                className={`px-1.5 py-0.5 rounded hover:text-white ${
                  user.role === "Management" ? "text-slate-200 font-semibold" : ""
                }`}
              >
                Mgmt
              </button>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                router.push("/auth");
              }}
              className="text-slate-400 hover:text-accent-rose space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Operational Container */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Welcome & Role Context Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {user.role === "QC Reviewer"
                ? "Quality Engineering Review Queue"
                : user.role === "Management"
                ? "Installation Lifecycle & Handover Oversight"
                : "Active Field Installation Jobs"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {user.role === "QC Reviewer"
                ? "Inspect requirement-linked evidence, validate completeness gates, and issue categorized deficiency decisions."
                : user.role === "Management"
                ? "Monitor site progress, review demobilization timelines, and inspect practical completion records."
                : "Record offline-capable evidence against assigned requirements and submit stages for remote QC approval."}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-accent-sky/30 text-accent-sky text-xs py-1">
              Offline Cache Ready
            </Badge>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/10 bg-surface-100/50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Assigned Jobs</span>
                <Layers className="h-4 w-4 text-accent-sky" />
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-white">3</span>
                <span className="ml-2 text-xs text-slate-500">active sites</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-surface-100/50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Stages Under Review</span>
                <ClipboardCheck className="h-4 w-4 text-accent-emerald" />
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-white">1</span>
                <span className="ml-2 text-xs text-slate-500">pending QC</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-surface-100/50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Open Deficiencies</span>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-amber-400">1</span>
                <span className="ml-2 text-xs text-slate-500">action required</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-surface-100/50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Ready for Handover</span>
                <FileCheck className="h-4 w-4 text-accent-emerald" />
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-white">1</span>
                <span className="ml-2 text-xs text-slate-500">certificate pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search site, tank model, or installer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-100 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-sky focus:outline-none focus:ring-1 focus:ring-accent-sky"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "all"
                  ? "bg-surface-200 border-accent-sky/50 text-white font-medium"
                  : "bg-surface-100 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              All Jobs
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "in_progress"
                  ? "bg-surface-200 border-accent-sky/50 text-white font-medium"
                  : "bg-surface-100 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("review")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "review"
                  ? "bg-surface-200 border-accent-sky/50 text-white font-medium"
                  : "bg-surface-100 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Under Review
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("deficiencies")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "deficiencies"
                  ? "bg-surface-200 border-amber-400/50 text-amber-300 font-medium"
                  : "bg-surface-100 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Deficiencies (1)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("handover")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "handover"
                  ? "bg-surface-200 border-accent-emerald/50 text-accent-emerald font-medium"
                  : "bg-surface-100 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Ready for Handover
            </button>
          </div>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="border-white/10 bg-surface-100/30 text-center py-12">
              <CardContent className="space-y-3">
                <Layers className="h-8 w-8 text-slate-500 mx-auto" />
                <CardTitle className="text-base">No Matching Installation Jobs Found</CardTitle>
                <CardDescription>
                  Try adjusting your search criteria or clear the current status filter.
                </CardDescription>
                <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="border-white/10 bg-surface-100/40 hover:border-white/20 transition-colors"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{job.id}</span>
                        <h2 className="text-base sm:text-lg font-semibold text-white">{job.siteName}</h2>
                        {job.status === "Ready for Handover" && (
                          <Badge variant="success" className="text-xs">
                            Ready for Handover
                          </Badge>
                        )}
                        {job.status === "Submitted for Review" && (
                          <Badge variant="default" className="text-xs bg-sky-500/20 text-sky-300 border-sky-500/30">
                            Under Review
                          </Badge>
                        )}
                        {job.status === "In Progress" && (
                          <Badge variant="outline" className="text-xs text-slate-300">
                            In Progress
                          </Badge>
                        )}
                        {job.openDeficiencies > 0 && (
                          <Badge variant="danger" className="text-xs flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{job.openDeficiencies} Deficiency Open</span>
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 font-medium">{job.tankModel}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center space-x-1">
                          <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                          <span>Lead: {job.assignedLead}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>
                            Stage Progress: {job.completedStages}/{job.totalStages} stages verified
                          </span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-accent-sky" />
                          <span>Demobilization: {job.plannedDemobilizationDate}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2 lg:pt-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="space-x-1.5 border-white/10 hover:border-accent-sky/50"
                        onClick={() => alert(`Job ${job.id} detail view will be wired in Slice 1.`)}
                      >
                        <span>{user.role === "QC Reviewer" ? "Inspect Job" : "Open Verification"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
