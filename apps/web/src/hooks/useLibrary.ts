'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export function useWorks(skip = 0, limit = 500) {
  return useQuery({
    queryKey: ['works', { skip, limit }],
    queryFn: () => fetchApi(`/works/?skip=${skip}&limit=${limit}`),
  });
}

export function useWork(workId: string) {
  return useQuery({
    queryKey: ['works', 'detail', workId],
    queryFn: () => fetchApi(`/works/${workId}`),
    enabled: !!workId,
  });
}

export function useEras() {
  const { data: works } = useWorks();
  
  if (!works) return [];
  
  const eras = new Set<string>(works.map((w: any) => w.era || 'Por definir'));
  return Array.from(eras);
}
