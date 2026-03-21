'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useChoirs() {
    return useQuery<any[]>({
        queryKey: ['choirs'],
        queryFn: () => fetchApi('/choirs/'),
    });
}

/** Current user's choir (for settings form) */
export function useMyChoir() {
    return useQuery<any | null>({
        queryKey: ['choir', 'me'],
        queryFn: () => fetchApi('/choirs/me').catch(() => null),
    });
}

export function useChoirMembers(choirId: string) {
    return useQuery<any[]>({
        queryKey: ['choir', choirId, 'members'],
        queryFn: () => fetchApi(`/management/choir/${choirId}/members`),
        enabled: !!choirId,
    });
}

export function useChoirSeasons(choirId: string) {
    return useQuery<any[]>({
        queryKey: ['choir', choirId, 'seasons'],
        queryFn: () => fetchApi(`/management/choir/${choirId}/seasons`),
        enabled: !!choirId,
    });
}

export function useChoirStats(choirId: string) {
    return useQuery<any>({
        queryKey: ['choir', choirId, 'stats'],
        queryFn: () => fetchApi(`/management/choir/${choirId}/stats`),
        enabled: !!choirId,
    });
}

/** Works belonging to a choir — used when composing director feedback */
export function useChoirWorks(choirId: string) {
    return useQuery<any[]>({
        queryKey: ['choir', choirId, 'works'],
        queryFn: () => fetchApi(`/works/choir/${choirId}`),
        enabled: !!choirId,
    });
}

/** Singer's view: seasons + projects + repertoire */
export function useRepertoire() {
    return useQuery<any[]>({
        queryKey: ['choir', 'repertoire'],
        queryFn: () => fetchApi('/management/choir/my-repertoire'),
    });
}

export function useInvites() {
    return useQuery<any[]>({
        queryKey: ['invites'],
        queryFn: () => fetchApi('/invites/me'),
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateMemberVoice(choirId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ memberId, voicePart }: { memberId: string; voicePart: string }) =>
            fetchApi(`/management/choir/${choirId}/members/${memberId}/voice?voice_part=${voicePart}`, { method: 'PUT' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['choir', choirId, 'members'] });
        },
    });
}

export function useRemoveMember(choirId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (memberId: string) =>
            fetchApi(`/management/choir/${choirId}/members/${memberId}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['choir', choirId, 'members'] });
        },
    });
}

export function useCreateSeason(choirId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; start_date: string | null; end_date: string | null }) =>
            fetchApi(`/management/choir/${choirId}/seasons`, {
                method: 'POST',
                body: JSON.stringify({ ...data, choir_id: choirId }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['choir', choirId, 'seasons'] });
        },
    });
}

export function useCreateInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { choir_id: string; max_uses: number | null; expires_at: string | null }) =>
            fetchApi('/invites/', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites'] });
        },
    });
}

export function useDeleteInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => fetchApi(`/invites/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites'] });
        },
    });
}

export function useSendFeedback(choirId: string) {
    return useMutation({
        mutationFn: (data: { recipient_id: string; work_id: string | null; content: string }) =>
            fetchApi(`/management/${choirId}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
    });
}
