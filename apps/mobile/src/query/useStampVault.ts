import { useQuery } from "@tanstack/react-query";

import { stampsApi } from "../api/stamps";

export function useStampVault(enabled = true) {
  return useQuery({
    queryKey: ["stamp-vault"],
    queryFn: () => stampsApi.getProgress(),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}