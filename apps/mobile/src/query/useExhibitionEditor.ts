import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { exhibitionsApi } from "../api/exhibitions";
import type { SaveExhibitionDraftDto } from "../types/api";

export function useExhibitionEditor(initialExhibitionId?: string) {
  const queryClient = useQueryClient();
  const [exhibitionId, setExhibitionId] = useState(initialExhibitionId);

  const createDraftMutation = useMutation({
    mutationFn: () => exhibitionsApi.createDraft(),
    onSuccess: async (draft) => {
      setExhibitionId(draft.exhibitionId);
      queryClient.setQueryData(["exhibition-editor", draft.exhibitionId], draft);
      await queryClient.invalidateQueries({ queryKey: ["organizer-dashboard"] });
    },
  });

  useEffect(() => {
    if (!exhibitionId && !createDraftMutation.isPending && !createDraftMutation.data) {
      createDraftMutation.mutate();
    }
  }, [createDraftMutation, exhibitionId]);

  const editorQuery = useQuery({
    queryKey: ["exhibition-editor", exhibitionId ?? "drafting"],
    queryFn: () => {
      if (!exhibitionId) {
        throw new Error("Exhibition draft is not ready yet.");
      }

      return exhibitionsApi.getEditor(exhibitionId);
    },
    enabled: Boolean(exhibitionId),
    staleTime: 60_000,
  });

  const saveDraftMutation = useMutation({
    mutationFn: (payload: SaveExhibitionDraftDto) => {
      if (!exhibitionId) {
        throw new Error("Exhibition draft is not ready yet.");
      }

      return exhibitionsApi.saveEditor(exhibitionId, payload);
    },
    onSuccess: async (draft) => {
      queryClient.setQueryData(["exhibition-editor", draft.exhibitionId], draft);
      await queryClient.invalidateQueries({ queryKey: ["organizer-dashboard"] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => {
      if (!exhibitionId) {
        throw new Error("Exhibition draft is not ready yet.");
      }

      return exhibitionsApi.publish(exhibitionId);
    },
    onSuccess: async (draft) => {
      queryClient.setQueryData(["exhibition-editor", draft.exhibitionId], draft);
      await queryClient.invalidateQueries({ queryKey: ["organizer-dashboard"] });
    },
  });

  return {
    exhibitionId,
    editorQuery,
    createDraftMutation,
    saveDraftMutation,
    publishMutation,
  };
}