'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface Lesson {
    id: string;
    title: string;
    level: string;
    type?: 'RHYTHM' | 'THEORY';
    lesson_type?: 'RHYTHM' | 'THEORY';
    order: number;
    completed?: boolean;
    content?: string | Record<string, any>;
    description?: string;
    goal?: string;
    exercises?: any[];
}

// Mock detail data — used as fallback when API is unavailable
const MOCK_LESSON_DETAIL: Record<string, Lesson> = {
    'm1': { id: 'm1', title: 'Las Figuras: La Negra', level: 'INICIACION', lesson_type: 'RHYTHM', order: 1, goal: 'Dominar el pulso de negra a 60 bpm', description: 'Aprende el pulso básico con la figura más fundamental del ritmo.', content: { text: 'La negra representa un pulso entero. Es la figura base del ritmo coral. En un compás de 2/4 caben exactamente dos negras.', notations: ['q', 'q', 'q', 'q'] }, exercises: [] },
    'm2': { id: 'm2', title: 'La Blanca y su silencio', level: 'INICIACION', lesson_type: 'RHYTHM', order: 2, goal: 'Mantener el sonido durante dos pulsos', description: 'Sonidos de dos pulsos.', content: { text: 'La blanca dura el doble que una negra (dos pulsos completos). El silencio de blanca tiene la misma duración sin emitir sonido.', notations: ['h', 'rh'] }, exercises: [] },
    'm3': { id: 'm3', title: 'El Pentagrama', level: 'ELEMENTAL', lesson_type: 'THEORY', order: 3, goal: 'Identificar las cinco líneas del pentagrama', description: 'Introducción a la notación musical.', content: { theory: 'El pentagrama son las cinco líneas horizontales donde se escriben las notas musicales. Las notas se sitúan sobre las líneas o en los espacios entre ellas.' }, exercises: [] },
    'm4': { id: 'm4', title: 'Clave de Sol', level: 'ELEMENTAL', lesson_type: 'THEORY', order: 4, goal: 'Leer notas en clave de sol', description: 'La clave que define la lectura de notas agudas.', content: { theory: 'La Clave de Sol indica que la segunda línea del pentagrama corresponde a la nota Sol. A partir de ella se deducen todas las demás.' }, exercises: [] },
    'm5': { id: 'm5', title: 'Ejercicio de Corcheas', level: 'BASICO', lesson_type: 'RHYTHM', order: 5, goal: 'Subdivisión binaria', description: 'Dividiendo el pulso en dos partes iguales.', content: { text: 'Dos corcheas caben en un solo pulso de negra. Son más rápidas y le dan energía al ritmo.', notations: ['8', '8', '8', '8'] }, exercises: [] },
    'm6': { id: 'm6', title: 'Intervalos I', level: 'BASICO', lesson_type: 'THEORY', order: 6, goal: 'Diferenciar tonos y semitonos', description: 'Distancias entre notas.', content: { theory: 'Un intervalo es la distancia entre dos notas. La 2ª son notas adyacentes; la 3ª salta una. Son la base de la afinación coral.' }, exercises: [] },
};

// Mock list data — used as fallback for the academy dashboard
const MOCK_LESSONS_LIST: Lesson[] = [
    { id: 'm1', title: 'Las Figuras: La Negra', level: 'INICIACION', type: 'RHYTHM', lesson_type: 'RHYTHM', order: 1, completed: true, description: 'Aprende el pulso básico.' },
    { id: 'm2', title: 'La Blanca y su silencio', level: 'INICIACION', type: 'RHYTHM', lesson_type: 'RHYTHM', order: 2, completed: false, description: 'Sonidos de dos pulsos.' },
    { id: 'm3', title: 'El Pentagrama', level: 'ELEMENTAL', type: 'THEORY', lesson_type: 'THEORY', order: 3, completed: false, description: 'Introducción a la notación.' },
    { id: 'm4', title: 'Clave de Sol', level: 'ELEMENTAL', type: 'THEORY', lesson_type: 'THEORY', order: 4, completed: false, description: 'Notas en el espacio.' },
    { id: 'm5', title: 'Ejercicio de Corcheas', level: 'BASICO', type: 'RHYTHM', lesson_type: 'RHYTHM', order: 5, completed: false, description: 'Dividiendo el pulso.' },
    { id: 'm6', title: 'Intervalos I', level: 'BASICO', type: 'THEORY', lesson_type: 'THEORY', order: 6, completed: false, description: 'Distancias entre notas.' },
    { id: 'm7', title: 'Lección Extra 1', level: 'INICIACION', type: 'THEORY', lesson_type: 'THEORY', order: 7, completed: false, description: 'Lección extra de teoría.' },
    { id: 'm8', title: 'Lección Extra 2', level: 'ELEMENTAL', type: 'RHYTHM', lesson_type: 'RHYTHM', order: 8, completed: false, description: 'Lección extra de ritmo.' },
    { id: 'm9', title: 'Lección Extra 3', level: 'BASICO', type: 'THEORY', lesson_type: 'THEORY', order: 9, completed: false, description: 'Otra lección de teoría.' },
    { id: 'm10', title: 'Lección Extra 4', level: 'INICIACION', type: 'RHYTHM', lesson_type: 'RHYTHM', order: 10, completed: false, description: 'Otra lección de ritmo.' },
    { id: 'm11', title: 'Página 2 - Introducción', level: 'INICIACION', type: 'THEORY', lesson_type: 'THEORY', order: 11, completed: false, description: 'Introducción a la segunda página.' },
    { id: 'm12', title: 'Página 2 - Ritmo Avanzado', level: 'ELEMENTAL', type: 'RHYTHM', lesson_type: 'RHYTHM', order: 12, completed: false, description: 'Ritmo avanzado para la segunda página.' },
];

export function useAcademyDashboard() {
  return useQuery({
    queryKey: ['academy', 'dashboard'],
    queryFn: async () => {
      try {
        return await fetchApi('/academy/dashboard');
      } catch (e) {
        console.warn("Using Mock Dashboard Data");
        const mk = (id: string, level: string, order: number) => ({ id, level, order });
        return {
          total_lessons: 30,
          completed_lessons: 1,
          current_lesson_id: 'm1',
          lessons: [
            mk('m1','INICIACION',1), mk('m2','INICIACION',2), mk('m3','INICIACION',3),
            mk('m4','INICIACION',4), mk('m5','INICIACION',5), mk('m6','INICIACION',6),
            mk('m7','INICIACION',7), mk('m8','INICIACION',8), mk('m9','INICIACION',9),
            mk('m10','INICIACION',10),
            mk('m11','ELEMENTAL',11), mk('m12','ELEMENTAL',12), mk('m13','ELEMENTAL',13),
            mk('m14','ELEMENTAL',14), mk('m15','ELEMENTAL',15), mk('m16','ELEMENTAL',16),
            mk('m17','ELEMENTAL',17), mk('m18','ELEMENTAL',18), mk('m19','ELEMENTAL',19),
            mk('m20','ELEMENTAL',20),
            mk('m21','BASICO',21), mk('m22','BASICO',22), mk('m23','BASICO',23),
            mk('m24','BASICO',24), mk('m25','BASICO',25), mk('m26','BASICO',26),
            mk('m27','BASICO',27), mk('m28','BASICO',28), mk('m29','BASICO',29),
            mk('m30','BASICO',30),
          ],
        };
      }
    },
  });
}

export function useLessons() {
  return useQuery<Lesson[]>({
    queryKey: ['academy', 'lessons'],
    queryFn: async () => {
      try {
        return await fetchApi('/academy/lessons');
      } catch (e) {
        console.warn("Using Mock Lessons Data (API unavailable)", e);
        return MOCK_LESSONS_LIST;
      }
    },
  });
}

export function useLesson(lessonId: string) {
  return useQuery<Lesson>({
    queryKey: ['academy', 'lesson', lessonId],
    queryFn: async () => {
      try {
        return await fetchApi(`/academy/lessons/${lessonId}`);
      } catch {
        const mock = MOCK_LESSON_DETAIL[lessonId];
        if (mock) return mock;
        throw new Error('Lección no encontrada');
      }
    },
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
