import { customAuthApiCall, customApiCall } from "@/app/service";

export const ValidateLogin = async (body: any) => {
  return customAuthApiCall('/api/auth/login', 'POST', {
    body,
    withCredentials: true, // important for cookies/session
  });
};

export const RegisterUser = async (body: any) => {
  return customApiCall('/api/register', 'POST', {
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

export const VerifyEmail = async (body: any) => {
  return customAuthApiCall('/api/auth/Email-verify', 'POST', {
    body,
    withCredentials: true,
  });
}
export const ForgotPasswordRequest = async (body: any) => {
    return customAuthApiCall('/api/auth/forgot-password', 'POST', {
    body,
    withCredentials: true,
  });
}
export const ResetPassword = async (body: any) => {
    return customAuthApiCall('/api/auth/reset-password', 'POST', {
    body,
    withCredentials: true,
  });
}
