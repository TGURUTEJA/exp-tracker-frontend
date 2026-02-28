"use client";
import React, { useState } from "react";
import { VerifyEmail } from "@/actions/AuthActions";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { LoginResponse } from "@/types/loginResponse";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  console.log("VerifyEmailPage rendered");
  const mutation = useMutation<LoginResponse, unknown, { email: string }>({
    mutationKey: ['resendVerification'],
    mutationFn: ({ email }) => VerifyEmail({"email":email}),
  });
  const state = useSelector((state: RootState) => state.counter);
  const [email, setEmail] = useState("");
  const [emailFromState, setEmailFromState] = useState(state.email || "");
  const [isSuccessverifyEmailPage,setIsSuccessverifyEmailPage] = useState(false); // Placeholder for actual success condition

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Resend verification link for email:", email);
    // Add mutation call here to resend link
    const emailToUse = emailFromState || email;
    const response = await mutation.mutateAsync({ email: emailToUse });
    console.log("Response from VerifyEmail mutation:", response);
    if (response && !response.error) {
      setIsSuccessverifyEmailPage(true);  
    }
    if(response && response.error){
      alert(response.message || "Error in sending verification email.");
    }

  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      
    { isSuccessverifyEmailPage ? 
    <> 
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-3xl font-semibold text-center text-stone-900 mb-6">
          Email is Sent Successfully
        </h2>
        <p className="text-center text-gray-600 mb-6">
          A verification link has been sent to your email address: <br />
          <span className="font-semibold text-blue-600">{emailFromState || email}</span>
        </p>
         <button
              type="button"
              onClick={handleSubmit}
              className="mb-3 w-full rounded-md bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              Resend Verification Link
            </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full rounded-md bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    </>: 

      (<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {emailFromState === "" && !isSuccessverifyEmailPage ? (
          <>
            <h2 className="text-3xl font-semibold text-center text-stone-900 mb-6">
              Verify Your Email
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please enter your email to receive a verification link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-stone-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Resend Verification Link
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-center text-stone-900 mb-4">
              Account Not Verified
            </h2>
            <p className="text-center text-gray-700 mb-2">
              We will send a verification link to your email address:
            </p>
            <p className="mb-1 text-center text-blue-600 font-semibold text-lg">
              {emailFromState}
            </p>
            <p className="text-center text-gray-600 mb-6">
              Not your email?{" "}
              <button
                onClick={() => setEmailFromState("")}
                className="underline text-blue-500 hover:text-blue-700 focus:outline-none cursor-pointer"
              >
                Click here to change
              </button>
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-md bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              Resend Verification Link
            </button>
          </>
        )}
      </div>)}
      
    </div>
  );
}
