'use client';

import { getUserData } from "@/app/actions";
import { UserData } from "@/types/store";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function ProfileCard() {
    let UserResponse : UserData = {
    id: null,
    firstName: '',
    lastName: '',
    dob: '',
    email: ''
  };
    const {data,isPending,isError} =  useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => getUserData(),// disable automatic query on mount
  });
  if(isPending){
    UserResponse = {
      id: null,
      firstName: 'Loading...',
        lastName: 'Loading...',
        dob: 'Loading...',
        email: 'Loading...'
    };
  }
  if(!isPending && !isError){
      UserResponse = data.data;
      UserResponse.email = "Test@gamil.com"
  }

  return (
    <div className="min-w-100 p-6 lg:ml-20 flex justify-center animate-fadeIn">
      {/* CARD CONTAINER */}
      <div
        className="
          w-full max-w-3xl 
          bg-slate-800 
          rounded-2xl p-6 
          shadow-xl 
          border border-slate-700
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700">
          {/* Avatar + Name */}
          <div className="flex items-center gap-6">
            <div
              className="
                w-24 h-24 rounded-full 
                bg-slate-600 
                flex items-center justify-center 
                text-4xl font-semibold 
                border border-slate-500
              "
            >
              A
            </div>

            <div>
              <p className="text-slate-300 text-lg">Hi</p>
              <h1 className="text-white text-2xl font-semibold">{UserResponse.firstName + " "+UserResponse.lastName}</h1>
            </div>
          </div>

          {/* EDIT BUTTON */}
          <button
            className="
              px-4 py-2 
              bg-slate-700 hover:bg-slate-600 
              text-white rounded-lg 
              border border-slate-600
            "
          >
            Edit
          </button>
        </div>

        {/* PERSONAL INFO TITLE */}
        <h2 className="mt-6 mb-4 text-lg text-white font-semibold underline underline-offset-4">
          Personal Info
        </h2>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* First Name */}
          <div className="flex flex-col">
            <label className="text-slate-400 text-sm">First Name</label>
            <p className="text-white text-base mt-1">{UserResponse.firstName}</p>
          </div>

          {/* Second Name */}
          <div className="flex flex-col">
            <label className="text-slate-400 text-sm">Second Name</label>
            <p className="text-white text-base mt-1">{UserResponse.lastName}</p>
          </div>

          {/* DOB */}
          <div className="flex flex-col">
            <label className="text-slate-400 text-sm">Date of Birth</label>
            <p className="text-white text-base mt-1">{UserResponse.dob}</p>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-slate-400 text-sm">Email</label>
            <p className="text-white text-base mt-1">{UserResponse.email}</p>
          </div>

        </div>
      </div>
    </div>
  );
}




   