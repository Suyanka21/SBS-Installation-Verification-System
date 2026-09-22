"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  FolderGit2,
  Database,
  Settings,
  LogOut,
  Plus,
  Search,
  ExternalLink,
  Cpu,
  Layers,
  CheckCircle2,
  FileText,
  AlertTriangle,
  FolderPlus,
  X,
} from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Draft" | "Review";
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut, signInDemo } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "draft">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState("Web App");

  // Sample seed projects
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([
    {
      id: "proj_1",
      name: "SoteSafiri Travel Portal",
      category: "Marketplace",
      status: "Active",
      updatedAt: "Today at 6:40 PM",
    },
    {
      id: "proj_2",
      name: "Anti-AI Design Token Studio",
      category: "Design System",
      status: "Active",
      updatedAt: "Yesterday",
    },
    {
      id: "proj_3",
      name: "Supabase Drizzle Pipeline",
      category: "Backend Engine",
      status: "Review",
      updatedAt: "3 days ago",
    },
  ]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: ProjectItem = {
      id: "proj_" + Math.random().toString(36).substring(2, 9),
      name: newProjectName.trim(),
      category: newProjectCategory,
      status: "Active",
      updatedAt: "Just now",
    };

    setProjectsList([newProj, ...projectsList]);
    setNewProjectName("");
    setShowAddModal(false);
  };

  const filteredProjects = projectsList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "active") return matchesSearch && p.status === "Active";
    if (activeTab === "draft") return matchesSearch && p.status === "Draft";
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-background text-slate-100">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/10 bg-surface-50/70 p-4 hidden md:flex flex-col justify-between">
        <div className="space-y-6">
          {/* Brand header */}
          <Link href="/" className="flex items-center space-x-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-sky text-black font-bold text-sm">
              S
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Suyanka App</p>
              <p className="text-[10px] text-slate-400 font-mono">Agent Foundation</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-surface-100 text-white text-sm font-medium border border-white/5"
            >
              <LayoutDashboard className="h-4 w-4 text-accent-sky" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <FolderGit2 className="h-4 w-4" />
              <span>Projects ({projectsList.length})</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Database (Drizzle)</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User profile & sign out */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          {user ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/auth");
                }}
                className="text-slate-400 hover:text-accent-rose p-1.5 rounded-md hover:bg-white/5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="warning" className="w-full justify-center text-[10px]">
                Demo Mode (Unauthenticated)
              </Badge>
              <Button variant="secondary" size="sm" onClick={() => signInDemo()} className="w-full text-xs">
                Activate Demo Account
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-surface-50/40 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500">Dashboard</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-200">Overview</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Landing Page
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="space-x-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </Button>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* METRIC KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-slate-400">Total Projects</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white">{projectsList.length}</span>
                <Badge variant="success">+1 this week</Badge>
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-400">Agent Skills</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-accent-sky">27 Active</span>
                <Badge variant="outline">.agents/skills</Badge>
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-400">Design Protocol</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white">Anti-AI</span>
                <Badge variant="success">Enforced</Badge>
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-400">ORM Provider</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-300">Drizzle</span>
                <Badge variant="outline">Supabase/Firebase</Badge>
              </div>
            </Card>
          </div>

          {/* PROJECT MANAGEMENT TABLE & CONTROLS */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle>Active Application Projects</CardTitle>
                <CardDescription>
                  Manage and monitor features governed by <code className="text-accent-sky font-mono">docs/PRD.md</code>.
                </CardDescription>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/10 bg-surface-100 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent-sky"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filteredProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-slate-400">
                        <th className="pb-3 font-medium">Project Name</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Last Modified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProjects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 font-medium text-white flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-accent-sky" />
                            <span>{proj.name}</span>
                          </td>
                          <td className="py-3.5 text-xs text-slate-400">{proj.category}</td>
                          <td className="py-3.5">
                            <Badge
                              variant={
                                proj.status === "Active"
                                  ? "success"
                                  : proj.status === "Review"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {proj.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-xs text-slate-500 font-mono">{proj.updatedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* EMPTY STATE CARD (CodeRabbit DNA & Anti-AI Design UX Pillar) */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-surface-100 border border-white/10 flex items-center justify-center text-slate-400">
                    <FolderPlus className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-semibold text-white">No matching projects found</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    No projects match your search criteria. Create a new project or clear your filter.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)}>
                    Create First Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI AGENT INTEGRATION PROMPT CARD */}
          <div className="rounded-xl border border-accent-sky/20 bg-accent-sky/[0.03] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-accent-sky/30 text-accent-sky">
                  Pro-Tip for Agents
                </Badge>
                <span className="text-xs text-slate-400">Documentation-Driven Development</span>
              </div>
              <p className="text-sm text-slate-200">
                To build new features into this template, open <code className="text-accent-sky font-mono">docs/PRD.md</code>, specify your requirements, and instruct your AI coder:
              </p>
              <p className="text-xs text-slate-400 font-mono">
                &quot;Read docs/PRD.md and implement the user journey in src/app/&quot;
              </p>
            </div>

            <Link href="/splash">
              <Button variant="outline" size="sm" className="shrink-0 space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-accent-sky" />
                <span>View Splash Demo</span>
              </Button>
            </Link>
          </div>
        </main>
      </div>

      {/* CREATE PROJECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/15 bg-surface-50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">Add New Project</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g., Realtime Analytics Engine"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Category</label>
                <select
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-surface-100 px-3 text-sm text-slate-100 focus:outline-none focus:border-accent-sky"
                >
                  <option value="Web App">Web App</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Backend Engine">Backend Engine</option>
                  <option value="Design System">Design System</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
