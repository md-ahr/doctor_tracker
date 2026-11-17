"use client";

import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth-api";
import { getAccessToken } from "@/lib/auth/access-token";

type UseSessionOptions = {
  bootstrapped?: boolean;
};

export function useSession(options: UseSessionOptions = {}) {
  const hasToken = getAccessToken() !== null;

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: hasToken || options.bootstrapped === true,
  });
}
