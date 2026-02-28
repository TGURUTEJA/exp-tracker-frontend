

export interface LoginResponse {
    message: string;
    id: number;
    error: boolean;
    errorMessage?: [string];
}

export interface RegisterResquest {
    userName: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    DOB?: string;
}