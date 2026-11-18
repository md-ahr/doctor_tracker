import type { Metadata } from "next";

import { DashboardScreen } from "@/features/dashboard/ui/dashboard-screen";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Review doctors, patients, and registration counts for the selected date range.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
