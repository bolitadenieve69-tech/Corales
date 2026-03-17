'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export function useAcademyDashboard() {
  return useQuery({
    queryKey: ['academy', 'dashboard'],
    queryFn: () => fetchApi('/academy/dashboard'),
  });
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['academy', 'lesson', lessonId],
    queryFn: () => fetchApi(`/academy/lessons/${lessonId}`),
    enabled: !!lessonId,
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lessonId: string) => 
      fetchApi(`/academy/lessons/${lessonId}/complete`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy'] });
    },
  });
}
