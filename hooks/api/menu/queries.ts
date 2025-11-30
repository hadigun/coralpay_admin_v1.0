import { useQuery } from '@tanstack/react-query';
import { getEntireService } from '@/api/menu';

export function useFetchEntireService(merchantId: string, serviceId: string) {
  return useQuery({
    queryKey: ['menu-service', serviceId],
    queryFn: () => getEntireService(merchantId, serviceId),
  });
}
