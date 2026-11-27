"use client";

import { getUserData, updateUserData } from "@/app/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, ReactNode, useEffect, useState } from "react";

export default function ProfileCompletionGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getUserData,
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [formError, setFormError] = useState("");
  const updateProfile = useMutation({
    mutationFn: updateUserData,
    onSuccess: async (response) => {
      queryClient.setQueryData(["dashboard"], response);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const profile = profileQuery.data?.data ?? null;
  const savedFirstName = profile?.firstName?.trim() ?? "";
  const savedLastName = profile?.lastName?.trim() ?? "";
  const savedDob = profile?.dob?.trim() ?? "";
  const missingDetails = !savedFirstName || !savedLastName || !savedDob;

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setDob(profile.dob ?? "");
    }
  }, [profile]);

  const isBlocked = profileQuery.isPending || profileQuery.isError || missingDetails;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!firstName.trim() || !lastName.trim() || !dob) {
      setFormError("First name, last name, and date of birth are required.");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save your profile. Please try again."
      );
    }
  };

  return (
    <>
      <div inert={isBlocked} aria-hidden={isBlocked}>
        {children}
      </div>
      {isBlocked && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-completion-title"
        >
          <section className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            {profileQuery.isPending ? (
              <div className="space-y-2 text-center">
                <h2 id="profile-completion-title" className="text-xl font-semibold text-white">
                  Checking your profile
                </h2>
                <p role="status" className="text-slate-200">
                  Loading your profile…
                </p>
              </div>
            ) : profileQuery.isError ? (
              <div className="space-y-4 text-center">
                <h2 id="profile-completion-title" className="text-xl font-semibold text-white">
                  Profile unavailable
                </h2>
                <p role="alert" className="text-sm text-red-300">
                  We could not load your profile. Retry before continuing.
                </p>
                <button
                  type="button"
                  disabled={profileQuery.isFetching}
                  onClick={() => void profileQuery.refetch()}
                  className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-300 disabled:cursor-wait disabled:opacity-60"
                >
                  {profileQuery.isFetching ? "Retrying…" : "Retry"}
                </button>
              </div>
            ) : (
              <>
                <h2 id="profile-completion-title" className="text-xl font-semibold text-white">
                  Complete your profile
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Add your name and date of birth to continue. Email is managed by your sign-in account.
                </p>
                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                  <label className="block text-sm text-slate-300">
                    First name
                    <input
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none focus:border-yellow-400"
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Last name
                    <input
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none focus:border-yellow-400"
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Date of birth
                    <input
                      type="date"
                      autoComplete="bday"
                      required
                      value={dob}
                      onChange={(event) => setDob(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none focus:border-yellow-400"
                    />
                  </label>
                  {formError && (
                    <p role="alert" className="text-sm text-red-300">
                      {formError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-300 disabled:cursor-wait disabled:opacity-60"
                  >
                    {updateProfile.isPending ? "Saving…" : "Save and continue"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
