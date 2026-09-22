export type SbsRole = "Installer" | "Lead Installer" | "QC Reviewer" | "Management";

export const SBS_ROLES: readonly SbsRole[] = [
  "Installer",
  "Lead Installer",
  "QC Reviewer",
  "Management",
] as const;
