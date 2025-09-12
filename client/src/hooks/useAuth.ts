import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Prevent aggressive refetching on window focus
    refetchOnWindowFocus: false,
    // Keep auth data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache auth data for 10 minutes
    gcTime: 10 * 60 * 1000,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}