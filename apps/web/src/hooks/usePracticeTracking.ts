'use client';

import { useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/api';

interface UsePracticeTrackingProps {
    workId: string;
    isActive: boolean;
    intervalMs?: number;
}

export function usePracticeTracking({
    workId,
    isActive,
    intervalMs = 30000 // Heartbeat every 30 seconds
}: UsePracticeTrackingProps) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastHeartbeatRef = useRef<number>(Date.now());

    const sendHeartbeat = async () => {
        const now = Date.now();
        const deltaMs = now - lastHeartbeatRef.current;
        const deltaMinutes = deltaMs / 60000;

        try {
            await fetchApi('/progress/', {
                method: 'POST',
                body: JSON.stringify({
                    work_id: workId,
                    status: 'EN_PROGRESO',
                    minutes_practiced: deltaMinutes
                })
            });
            lastHeartbeatRef.current = now;
            console.log(`Heartbeat sent: +${deltaMinutes.toFixed(2)} min for work ${workId}`);
        } catch (error) {
            console.error('Failed to send heartbeat', error);
        }
    };

    useEffect(() => {
        if (isActive) {
            lastHeartbeatRef.current = Date.now();
            timerRef.current = setInterval(sendHeartbeat, intervalMs);
        } else {
            if (timerRef.current) {
                // Final update on stop
                sendHeartbeat();
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive, workId, intervalMs]);

    return {};
}
