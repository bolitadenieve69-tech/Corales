import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export function useDirectorNotes(workId?: string) {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotes = async () => {
            try {
                const allNotes = await fetchApi('/users/me/feedback');
                if (workId) {
                    // Filter notes specifically for this work (contextual)
                    // and keep general notes (where work_id is null) as well?
                    // Let's keep only specific ones and maybe a flag for general ones.
                    setNotes(allNotes.filter((n: any) => n.work_id === workId || !n.work_id));
                } else {
                    setNotes(allNotes);
                }
            } catch (err) {
                console.error("Error loading director notes", err);
            } finally {
                setLoading(false);
            }
        };
        loadNotes();
    }, [workId]);

    const markAsRead = async (noteId: string) => {
        try {
            await fetchApi(`/users/me/feedback/${noteId}/read`, { method: 'PUT' });
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (err) {
            console.error("Error marking note as read", err);
        }
    };

    return { notes, loading, markAsRead };
}
