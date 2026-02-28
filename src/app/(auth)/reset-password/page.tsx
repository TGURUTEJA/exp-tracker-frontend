'use client';
import { ForgotPasswordRequest, ResetPassword } from "@/actions/AuthActions";
import { RootState } from "@/store/store";
import { LoginResponse, UserData } from "@/types/loginResponse";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ResetPasswordPage() {
    const state = useSelector((state:RootState) => state.counter);
    const router = useRouter();
     const mutanion = useMutation<LoginResponse,unknown,{newPassword:string,OTP:string}>({
            mutationKey: ['forgotPassword'],
            mutationFn: (payload) => ResetPassword(payload)
    });
    const mutanionOTP = useMutation<LoginResponse, unknown, UserData>({
            mutationKey: ['forgotPassword'],
            mutationFn: (payload) => ForgotPasswordRequest(payload)
        });
    useEffect(() => {
        console.log("ResetPasswordPage mounted with state:", state);
        if((state.email=="" && state.userName=="") || (state.email==null && state.userName==null)){
            alert("Unauthorized Access to Reset Password Page");
            window.location.href="/forgot-password";
        }

    }, []);
    const hanbleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const newPassword = String(formData.get("newPassword") || "").trim();
        const confirmPassword = String(formData.get("confirmPassword") || "").trim();
        const OTP = String(formData.get("OTP") || "").trim();
        const payload = {
            "newPassword": newPassword,
            "OTP": OTP,
        }
        const response = await mutanion.mutateAsync(payload);
        if(response && response.error){
            alert("Error: "+response.message);
            router.push("/forgot-password");
            return;
        }
         alert("Password Reset Successful. Please login with your new password.");
        router.push("/login");
        return;
    }

    const handleResendOTP = async () => {
        if((state.email=="" && state.userName=="") || (state.email==null && state.userName==null)){
            alert("Unauthorized Access to Reset Password Page");
            window.location.href="/forgot-password";
        }
        const payload: UserData = {
            userName: state.userName || "",
            email: state.email || "",
            id: null
        };
        const OTPRes= await mutanionOTP.mutateAsync(payload);
        if(OTPRes && OTPRes.error){
            alert("Error in resending OTP. Please try again later.");
            return;
        }
        alert("OTP has been resent to your email.");
        return;
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <form className="space-y-4" onSubmit={hanbleSubmit} >
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">       
                            Confirm Password
                        </label>
                        <input  

                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">
                            OTP
                        </label>
                        <input
                            type="text"
                            id="OTP"
                            name="OTP"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <samp onClick={handleResendOTP} className="text-sm text-blue-500 hover:underline cursor-pointer">Re-Send OTP</samp>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"> 
                        Reset Password
                    </button>
                </form> 
            </div>
        </div>
    );
}