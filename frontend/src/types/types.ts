export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
    createdAt?: string;
    isTwoFactorEnabled?: boolean;
    profileImage?: string;
    credits?: number;
}

export interface Pagination {
    limit: number;
    page: number;
    pages: number;
    total: number;
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

