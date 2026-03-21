'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export interface DbAsset {
  id: string;
  edition_id: string;
  asset_type: string;
  original_filename: string;
}

const MOCK_WORKS: any[] = [
  { id: 'mock-1', title: 'Ave Verum Corpus', composer: 'W.A. Mozart', era: 'Clasicismo' },
  { id: 'mock-2', title: 'O Magnum Mysterium', composer: 'Tomás Luis de Victoria', era: 'Renacimiento' },
  { id: 'mock-3', title: 'Cantique de Jean Racine', composer: 'Gabriel Fauré', era: 'Romanticismo' },
  { id: 'mock-4', title: 'Lux Aeterna', composer: 'Morten Lauridsen', era: 'Contemporánea' },
  { id: 'mock-5', title: 'Gloria', composer: 'Antonio Vivaldi', era: 'Barroco' },
];

export function useWorks(skip = 0, limit = 500) {
  return useQuery({
    queryKey: ['works', { skip, limit }],
    queryFn: async () => {
      try {
        return await fetchApi(`/works/?skip=${skip}&limit=${limit}`);
      } catch (e) {
        console.warn('useWorks: API unavailable, using mock data');
        return MOCK_WORKS;
      }
    },
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

export function useScoreAssets() {
  return useQuery<DbAsset[]>({
    queryKey: ['score-assets'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('id, edition_id, asset_type, original_filename');
      if (error) throw new Error(error.message);
      return (data ?? []) as DbAsset[];
    },
    staleTime: 60_000,
  });
}

// --- Typed API models for works with nested editions/assets ---

export interface ApiAsset {
  id: string;
  edition_id: string;
  asset_type: string;
  original_filename?: string;
  file_url?: string;
}

export interface ApiEdition {
  id: string;
  work_id: string;
  assets: ApiAsset[];
}

export interface ApiWork {
  id: string;
  title: string;
  composer?: string;
  voice_format?: string;
  era?: string;
  editions: ApiEdition[];
}

/**
 * Fetches works with nested editions and assets from the API.
 * On failure silently returns [] so the caller can fall back to local data.
 */
export function useWorksWithEditions(skip = 0, limit = 500) {
  return useQuery<ApiWork[]>({
    queryKey: ['works', 'with-editions', { skip, limit }],
    queryFn: async () => {
      try {
        return await fetchApi(`/works/?skip=${skip}&limit=${limit}`);
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}
