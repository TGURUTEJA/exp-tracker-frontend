'use client';

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  loading: boolean;
}

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  categoryName,
  loading,
}: DeleteConfirmationModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[999]
        bg-black/60 backdrop-blur-sm
        flex items-center justify-center
        animate-fadeIn
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-[90%] max-w-md
          bg-slate-800 rounded-2xl
          border border-slate-700 
          p-6 shadow-2xl 
          animate-slideUp
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
          onClick={onClose}
          disabled={loading}
        >
          <X size={20} />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 mb-4 text-red-400">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Delete Category</h3>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to delete the category <span className="font-semibold text-white">&quot;{categoryName}&quot;</span>?
          </p>
          <p className="text-red-400/80 text-xs mt-2 font-medium">
            This action cannot be undone and may affect existing transactions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-red-600/20 transition-all"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
