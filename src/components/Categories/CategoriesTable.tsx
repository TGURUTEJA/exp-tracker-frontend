'use client';

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import { getCategories, GetCategoriesResponse, Category } from "@/app/actions";

interface CategoriesTableProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoriesTable({ onEdit, onDelete }: CategoriesTableProps) {
  const {
    data: response,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<GetCategoriesResponse>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  if (isPending) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-8 flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-8"
      >
        <div className="text-slate-400 animate-pulse font-medium">Loading categories...</div>
      </div>
    );
  }

  if (isError || !response || response.error) {
    return (
      <div
        role="alert"
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-950/30 p-6 text-red-300"
      >
        <span>
          {isError
            ? error?.message || "Failed to load categories"
            : response?.message || "Failed to load categories"}
        </span>
        <button
          type="button"
          onClick={() => void refetch()}
          className="shrink-0 font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const categories = response.data || [];

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl">
      <div className="p-5 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">All Categories</h2>
        <p className="text-xs text-slate-400 mt-1">List of category types and associations</p>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          No categories found. Click the + button to add one!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table aria-label="All categories" className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Category Name</th>
                <th scope="col" className="px-6 py-4">Type</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm text-slate-300">
              {categories.map((category) => (
                <tr 
                  key={category.id} 
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">#{category.id}</td>
                  <td className="px-6 py-4 font-semibold text-white">{category.name}</td>
                  <td className="px-6 py-4">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.type === "NEED" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : category.type === "WANT"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {category.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        aria-label={`Edit ${category.name}`}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-700/50 hover:text-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        aria-label={`Delete ${category.name}`}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-700/50 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

