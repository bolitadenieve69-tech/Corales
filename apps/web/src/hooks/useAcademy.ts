'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export function useAcademyDashboard() {
  return useQuery({
    queryKey: ['academy', 'dashboard'],
    queryFn: async () => {
      try {
        return await fetchApi('/academy/dashboard');
      } catch (e) {
        console.warn("Using Mock Dashboard Data");
        return {
          total_lessons: 12,
          completed_lessons: 1,
          current_lesson_id: 'm1',
          lessons: [
            { id: 'm1', level: 'INICIACION' },
            { id: 'm2', level: 'INICIACION' },
            { id: 'm3', level: 'ELEMENTAL' },
            { id: 'm4', level: 'ELEMENTAL' },
            { id: 'm5', level: 'BASICO' },
            { id: 'm6', level: 'BASICO' },
          ]
        };
      }
    },
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
