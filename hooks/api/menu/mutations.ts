import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyServiceChanges } from '@/api/menu';

export function useApplyServiceChanges(merchantId: string, serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changes: any) => applyServiceChanges(merchantId, serviceId, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-service', serviceId] });
    },
  });
}
