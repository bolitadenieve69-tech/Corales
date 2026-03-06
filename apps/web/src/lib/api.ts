// Centralized API utility for Next.js

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://corales-production.up.railway.app';
export const API_URL = rawUrl.includes('/api/v1') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api/v1`;

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

export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}

export async function login(email: string, password: string): Promise<any> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/login/access-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
    }
    return data;
}

/**
 * Wrapper around native fetch that automatically adds the Authorization header
 * and prepends the base API URL.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers as Record<string, string>,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

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
