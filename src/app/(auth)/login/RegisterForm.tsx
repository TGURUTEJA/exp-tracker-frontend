'use client';
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { RegisterUser } from "../../../actions/AuthActions";
import { LoginResponse, RegisterResquest } from "../../../types/loginResponse";
import {  useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";


type Props = {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
};

export default function RegisterForm({ setIsLogin }: Props) {
  // Keep form inputs largely uncontrolled; control only what’s needed
  const router = useRouter();
  const dispatch = useDispatch();
  const mutation = useMutation<LoginResponse,unknown,RegisterResquest>({
      mutationKey: ['login'],
      mutationFn: (payload) => RegisterUser(payload)
    })
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Consolidated errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordMatchError = useMemo(() => {
    if (!confirm) return "";
    return confirm !== password ? "Passwords do not match" : "";
  }, [password, confirm]);

  const clearFieldError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: RegisterResquest = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      userName: String(formData.get("userName") || "").trim(),
      DOB: String(formData.get("birthDate") || ""),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
    };

    // Client-side checks
    const nextErrors: Record<string, string> = {};
    if (!payload.firstName) nextErrors.firstName = "First name is required";
    if (!payload.lastName) nextErrors.lastName = "Last name is required";
    if (!payload.userName) nextErrors.userName = "Username is required";
    if (!payload.DOB) nextErrors.birthDate = "Birth date is required";
    if (!payload.email) nextErrors.email = "Email is required";
    if (!payload.password) nextErrors.password = "Password is required";
    if (passwordMatchError) nextErrors.confirmPassword = passwordMatchError;

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
    const res = await mutation.mutateAsync(payload);
    dispatch({ type: 'SET_CREDENTIALS', payload: { userName: payload.userName || null, email: payload.email || null, id : res.id } });
    console.log("registear",res);
      if (!res.error) {
        alert("Registration successful!");

        router.push("/verify_Email");
        return;
      }

      // Map server-side errors
      const serverErrors: Record<string, string> = {};
      if ("errorData" in res && Array.isArray(res.errorData)) {
        for (const err of res.errorData) {
            console.log(err);
          if (!err.error) continue;
          const key =
            err.field === "username" ? "userName" : err.field; // normalize
            console.log(key);
          serverErrors[key] = err.message;

        }
      }
      console.log("Test"+serverErrors["userName"]);
      setErrors(serverErrors);
    } catch (err) {
      setErrors({ _global: "Unexpected error. Please try again." });
      // optionally log err to monitoring
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-stone-950">Register</h2>

      <form className="space-y-4" onSubmit={handleRegister} noValidate>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              onFocus={() => clearFieldError("firstName")}
              className="text-gray-700 mt-1 w-46 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              onFocus={() => clearFieldError("lastName")}
              className="text-gray-700 mt-1 w-46 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              required
              onFocus={() => clearFieldError("userName")}
              className="text-gray-700 mt-1 block w-56 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-invalid={!!errors.userName}
              aria-describedby={errors.userName ? "userName-error" : undefined}
            />
            {errors.userName && (
              <p id="userName-error" className="mt-1 text-sm text-red-600">
                {errors.userName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
              Date of birth
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              required
              onFocus={() => clearFieldError("birthDate")}
              className="text-gray-700 mt-1 block w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-invalid={!!errors.birthDate}
              aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
            />
            {errors.birthDate && (
              <p id="birthDate-error" className="mt-1 text-sm text-red-600">
                {errors.birthDate}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            onFocus={() => clearFieldError("email")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="relative text-gray-700">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 bg-red-50"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-8 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <div className="relative text-gray-700">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              clearFieldError("confirmPassword");
            }}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
              passwordMatchError || errors.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 bg-red-50"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
            aria-invalid={!!(passwordMatchError || errors.confirmPassword)}
            aria-describedby={
              passwordMatchError || errors.confirmPassword ? "confirmPassword-error" : undefined
            }
          />
          {passwordMatchError && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
              {passwordMatchError}
            </p>
          )}
          {!passwordMatchError && errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {errors._global && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors._global}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Register
        </button>
      </form>
    </>
  );
}
