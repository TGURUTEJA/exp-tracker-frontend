import { useState } from "react";

export default function PasswordInput( {passwordError,setPasswordError, setPasswordErrorMessage}) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <>
            <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                onChange={() => {
                    setPasswordError(false);
                    setPasswordErrorMessage("");
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${passwordError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:text-stone-950"
                    }`}
            />
            <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none pt-5"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.17-2.5 3.12-4.56 5.45-5.7" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        <span className="sr-only">Hide password</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="sr-only">Show password</span>
                    </>
                )}
            </button>
        </>
    );
}