'use client';

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { createCategory, updateCategory, Category } from "@/app/actions";
import { ErrorMessageExtractor } from "@/Helper/AuthHelper";

interface ModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
  categoryToEdit?: Category | null;
}

export default function CreateCategotiesModel({ open, setOpen, onSuccess, categoryToEdit }: ModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("NEED");
  const [icon, setIcon] = useState("food");
  const [color, setColor] = useState("red");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-hide floating error message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Populate or reset form values when modal opens or categoryToEdit changes
  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setName(categoryToEdit.name || "");
        setType(categoryToEdit.type || "NEED");
        setIcon(categoryToEdit.icon || "food");
        setColor(categoryToEdit.color || "red");
      } else {
        setName("");
        setType("NEED");
        setIcon("food");
        setColor("red");
      }
      setErrorMsg(null);
    }
  }, [categoryToEdit, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let response;
      if (categoryToEdit) {
        response = await updateCategory({
          id: Number(categoryToEdit.id),
          name,
          type,
          icon,
          color,
        });
      } else {
        response = await createCategory({ name, type, icon, color });
      }
      
      // If error is explicitly true or backend returned an error
      if (response && (typeof response === "string" || response.error)) {
        const extracted = ErrorMessageExtractor(response);
        setErrorMsg(extracted);
      } else {
        // Success
        setName("");
        setType("NEED");
        setIcon("food");
        setColor("red");
        setOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      const fallbackMessage = `Failed to ${categoryToEdit ? "update" : "create"} category`;
      setErrorMsg(err instanceof Error && err.message ? err.message : fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ERROR TOAST */}
      {errorMsg && (
        <div className="fixed top-5 right-5 z-[1000] flex items-center gap-3 bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-slideInLeft max-w-sm">
          <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
          <div className="flex-1 text-sm font-medium">{errorMsg}</div>
          <button 
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-red-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MODAL BACKDROP */}
      <div
        className="
          fixed inset-0 z-[999]
          bg-black/40 backdrop-blur-sm
          flex items-center justify-center
          animate-fadeIn
        "
        onClick={() => setOpen(false)}
      >
        {/* MODAL CONTENT */}
        <div
          className="
            relative w-[90%] max-w-md
            bg-slate-800 rounded-2xl
            border border-slate-700 
            p-6 shadow-xl 
            animate-slideUp
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-3 right-3 text-slate-300 hover:text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>

          {/* Header */}
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-3">
            {categoryToEdit ? "Edit Category" : "Create Category"}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Food, Rent, Utilities"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Category Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              >
                <option value="NEED">NEED</option>
                <option value="WANT">WANT</option>
                <option value="SAVINGS">SAVINGS</option>
                <option value="INVESTMENT">INVESTMENT</option>
              </select>
            </div>

            {/* Icon */}
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Icon</label>
              <input
                type="text"
                required
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., food, home, car"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              />
            </div>

            {/* Color */}
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Color</label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., red, blue, green"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              />
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-600 disabled:text-slate-400 text-slate-900 rounded-lg font-semibold transition"
              >
                {loading ? (categoryToEdit ? "Saving..." : "Creating...") : (categoryToEdit ? "Save Changes" : "Create Category")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

