'use client';
import React from "react";
import { LoginResponse, UserData } from "@/types/loginResponse";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ForgotPasswordRequest } from "@/actions/AuthActions";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const mutanion = useMutation<LoginResponse, unknown, UserData>({
        mutationKey: ['forgotPassword'],
        mutationFn: (payload) => ForgotPasswordRequest(payload)
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        console.log("ForgotPassword form submitted", formData);
        let payload: UserData = {
            userName: String(formData.get("userName") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            id: null
        };
        if (payload.email == "" && payload.userName == "") {
            alert("Please provide either Email or User Name");
            return;
        }
        const response = await mutanion.mutateAsync(payload);
        if (response && response.error) {
            alert("Error: " + response.message);
            console.log("ForgotPassword error response:", response);
            if (response.message && response.message == "account is not verified; please verify first") {
                dispatch({ type: 'SET_CREDENTIALS', payload: { userName: payload.userName || null, email: payload.email || null, id: response.id } });
                router.push("/verify_Email");
                return;
            }
            return;
        }
        dispatch({ type: 'SET_CREDENTIALS', payload: { userName: payload.userName || null, email: payload.email || null, id: response.id } });
        router.push("/reset-password");
        return;

    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-700">Forgot Password</h2>
                <form className="space-y-4" onSubmit={handleSubmit} >
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center justify-center mb-0">
                        <span className="text-gray-500">OR</span>
                    </div>
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                            User Name
                        </label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
}


