import { getDashboard } from "@/lib/api/doctor-tracker-api";

export const dashboardApi = {
  get: (range: { from: string; to: string }) => getDashboard(range),
};
