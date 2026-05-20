import { useQuery } from "@tanstack/react-query";

import { exhibitionsApi } from "../api/exhibitions";

export function useExhibitionDetail(exhibitionId: string) {
  return useQuery({
    queryKey: ["exhibition-detail", exhibitionId],
    queryFn: () => exhibitionsApi.getDetail(exhibitionId),
    enabled: exhibitionId.length > 0,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}