

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

/** Body for forgot-password / resend OTP (email or username). */
export interface ForgotPasswordPayload {
    userName: string;
    email: string;
    id: number | null;
}