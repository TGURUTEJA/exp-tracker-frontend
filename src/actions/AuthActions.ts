import { customAuthApiCall, customApiCall } from "@/app/service";
import type { LoginResponse } from "@/types/loginResponse";

export const ValidateLogin = async (body: unknown) => {
  return customAuthApiCall<LoginResponse>("/api/auth/login", "POST", {
    body,
    withCredentials: true, // important for cookies/session
  });
};

export const RegisterUser = async (body: unknown) => {
  return customApiCall<LoginResponse>("/api/register", "POST", {
    body,
    withCredentials: true,
  });
};
export const LogoutUser = async () => {
  localStorage.removeItem("isLoggedIn");
  customAuthApiCall('/api/auth/logout', 'POST', {
    body:{logout:true},
    withCredentials: true,
  }).then(() => {
    window.location.href = "/login";
  }); 
};

export const VerifyEmail = async (body: unknown) => {
  return customAuthApiCall<LoginResponse>("/api/auth/Email-verify", "POST", {
    body,
    withCredentials: true,
  });
}
export const ForgotPasswordRequest = async (body: unknown) => {
  return customAuthApiCall<LoginResponse>("/api/auth/forgot-password", "POST", {
    body,
    withCredentials: true,
  });
}
export const ResetPassword = async (body: unknown) => {
  return customAuthApiCall<LoginResponse>("/api/auth/reset-password", "POST", {
    body,
    withCredentials: true,
  });
}
