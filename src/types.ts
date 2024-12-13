export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    avatar_url: string;
    created_at: Date;
    updated_at: Date;
}

export interface FakeUser {
    id?: number;
    username: string;
    email: string;
    password: string;
    avatar_url: string;
}

export interface Category {
    id?: number;
    name: string;
    sorting: number;
    created_at?: Date;
    updated_at?: Date;
}