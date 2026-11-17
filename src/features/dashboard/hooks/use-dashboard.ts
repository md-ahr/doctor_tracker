"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/features/dashboard/api/dashboard-api";

export function useDashboard(from: string, to: string) {
  return useQuery({
    queryKey: ["dashboard", from, to],
    queryFn: () => dashboardApi.get({ from, to }),
    staleTime: 60_000,
  });
}
