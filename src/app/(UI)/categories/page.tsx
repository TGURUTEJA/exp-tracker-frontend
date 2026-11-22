'use client';

import { useState } from "react";
import { Plus, AlertCircle, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AccountSummary from "@/components/Account/AccountSummary";
import CreateCategotiesModel from "@/components/Categories/CreateCategotiesModel";
import CategoriesTable from "@/components/Categories/CategoriesTable";
import DeleteConfirmationModal from "@/components/Categories/DeleteConfirmationModal";
import { deleteCategory, Category } from "@/app/actions";
import { ErrorMessageExtractor } from "@/Helper/AuthHelper";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setCategoryToEdit(null);
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleteLoading(true);
    setErrorMsg(null);

    try {
      const response = await deleteCategory(Number(categoryToDelete.id));
      if (response && (typeof response === "string" || response.error)) {
        const extracted = ErrorMessageExtractor(response);
        setErrorMsg(extracted);
      } else {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setCategoryToDelete(null);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error && err.message ? err.message : "Failed to delete category");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-20 px-6 max-w-7xl mx-auto">
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

      <AccountSummary />
      
      {/* CATEGORIES TABLE */}
      <CategoriesTable 
        onEdit={handleEdit} 
        onDelete={handleDeleteClick} 
      />
      
      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => {
          setCategoryToEdit(null);
          setIsModalOpen(true);
        }}
        aria-label="Add Category"
        className="
          fixed bottom-8 right-8 z-50
          flex items-center justify-center 
          bg-yellow-500 hover:bg-yellow-400 
          text-slate-950 w-14 h-14 
          rounded-full shadow-lg hover:shadow-yellow-500/30 
          hover:scale-105 active:scale-95
          transition-all duration-200 
          cursor-pointer border border-yellow-400/20
        "
      >
        <Plus size={28} />
      </button>

      {/* CREATE / EDIT CATEGORY MODAL */}
      <CreateCategotiesModel 
        open={isModalOpen} 
        setOpen={(open) => {
          setIsModalOpen(open);
          if (!open) setCategoryToEdit(null);
        }} 
        categoryToEdit={categoryToEdit}
        onSuccess={handleSuccess}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete?.name || ""}
        loading={isDeleteLoading}
      />
    </div>
  );
}

