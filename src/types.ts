export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export interface Role {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserRole {
    id: number;
    role_id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}