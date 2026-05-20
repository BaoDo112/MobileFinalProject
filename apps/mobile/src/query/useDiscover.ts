import { useQuery } from "@tanstack/react-query";

import { exhibitionsApi, type DiscoverFilters } from "../api/exhibitions";

function normalizeFilter(value?: string) {
  return value?.trim() || undefined;
}

export function useDiscover(filters: DiscoverFilters = {}) {
  const normalizedFilters: DiscoverFilters = {
    timeline: filters.timeline,
    district: normalizeFilter(filters.district),
    type: normalizeFilter(filters.type),
    registrationState: filters.registrationState,
    organizerId: normalizeFilter(filters.organizerId),
  };

  return useQuery({
    queryKey: [
      "discover-exhibitions",
      normalizedFilters.timeline ?? "all",
      normalizedFilters.district ?? "all",
      normalizedFilters.type ?? "all",
      normalizedFilters.registrationState ?? "all",
      normalizedFilters.organizerId ?? "all",
    ],
    queryFn: () => exhibitionsApi.list(normalizedFilters),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}