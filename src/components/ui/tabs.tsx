"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-1 rounded-lg bg-surface-100 p-1 border border-white/5", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-sky",
              isActive
                ? "bg-surface-50 text-white shadow-sm border border-white/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
