import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { formSchemasApi } from "../api/formSchemas";
import type { SaveFormSchemaDto } from "../types/api";

export function useFormBuilder(exhibitionId: string) {
  const queryClient = useQueryClient();

  const formSchemaQuery = useQuery({
    queryKey: ["form-builder", exhibitionId],
    queryFn: () => formSchemasApi.getEditor(exhibitionId),
    enabled: Boolean(exhibitionId),
    staleTime: 60_000,
  });

  const saveFormSchemaMutation = useMutation({
    mutationFn: (payload: SaveFormSchemaDto) => formSchemasApi.saveEditor(exhibitionId, payload),
    onSuccess: async (schema) => {
      queryClient.setQueryData(["form-builder", exhibitionId], schema);
      await queryClient.invalidateQueries({ queryKey: ["exhibition-editor", exhibitionId] });
      await queryClient.invalidateQueries({ queryKey: ["organizer-dashboard"] });
    },
  });

  return {
    formSchemaQuery,
    saveFormSchemaMutation,
  };
}