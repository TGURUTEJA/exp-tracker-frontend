import { LoginResponse } from "../types/loginResponse";

export async function AuthResponseFilter(response : Response) : Promise<LoginResponse | string> {
    const contentType = response.headers.get('content-type') || '';
    const payload : LoginResponse = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');
    if(response.status === 500) {
        if (typeof payload === 'string') {
            alert(`Server Error: ${payload}`);
        } else if (payload && payload.errorMessage) {
           return payload;
        }
    }
    return payload;
}

export function ErrorMessageExtractor(response: LoginResponse | string): string {
    if (typeof response === 'string') {
        return response;
    } else if (response && 'message' in response) {
        return response.message || 'An error occurred';
    }
    return 'An unknown error occurred';
}

export async function AuthJWTResponseFilter(response : Response) : Promise<LoginResponse | string> {
    const contentType = response.headers.get('content-type') || '';
    const payload : LoginResponse = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');
    if(response.status === 500) {
        if (typeof payload === 'string') {
            alert(`Server Error: ${payload}`);
        } else if (payload && payload.errorMessage) {
           return payload;
        }
    }
    if(response.status === 401) {
        if (payload.message === "Account is not verified" && typeof window !== "undefined") {
            window.location.href = "/verify_Email";
            return payload;
        }
        if (typeof window !== "undefined") {
            window.location.href = "/login";
            return Promise.resolve(payload);
        }
    }
    return payload;
}

