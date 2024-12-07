export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export interface FakeUser {
    id?: number;
    username: string;
    email: string;
    password: string;
}