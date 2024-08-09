export const token = (): string | null => {
    return localStorage.getItem('token') || null;
} 