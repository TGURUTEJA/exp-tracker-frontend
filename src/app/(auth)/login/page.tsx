"use client";
import { useState } from "react";
import LoginForm from "./loginForm";
import RegisterForm from "./RegisterForm";
export default function LoginPage() {

  const [isLogin, setIslogin] = useState(true);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {isLogin ? (
          <LoginForm/>
        ) : (
          <RegisterForm setIsLogin = {setIslogin}/>
        )}
        <div className="text-gray-500">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setIslogin(false)}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setIslogin(true)}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
