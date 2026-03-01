// Centralized API utility for Next.js

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Helper to get the auth token from cookies (if doing client side fetching)
 * or local storage, depending on how auth was implemented.
 * For now, assuming it's in localStorage for MVP.
 */
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
}

/**
 * Wrapper around native fetch that automatically adds the Authorization header
 * and prepends the base API URL.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Determine full URL. If endpoint starts with http, use it as is.
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Handle common errors like 401 Unauthorized globally if needed
        if (response.status === 401 && typeof window !== 'undefined') {
            // Optional: redirect to login or clear token
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Try to parse JSON unless it's a 204 No Content
    if (response.status === 204) {
        return null;
    }

    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}
