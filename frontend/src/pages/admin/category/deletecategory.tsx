import  { useState } from "react";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import categoryService, { Category } from "../../../services/category.service";

interface DeleteCategoryConfirmProps {
  category: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeleteCategoryConfirm({ category, onSuccess, onCancel }: DeleteCategoryConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await categoryService.deleteCategory(category.id);
      Helpers.showToast('Category deleted successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setError(err.response?.data?.message || "Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl">Delete Category</SheetTitle>
        <SheetDescription>
          Are you sure you want to delete this category?
        </SheetDescription>
      </SheetHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded">
        <p className="font-medium">Warning!</p>
        <p>This action cannot be undone. This will permanently delete the category "{category.name}".</p>
        <p className="mt-2">All questions associated with this category may be affected.</p>
      </div>

      <div className="space-y-2">
        <p className="font-medium">Category details:</p>
        <p><span className="font-medium">Name:</span> {category.name}</p>
        <p><span className="font-medium">Description:</span> {category.description}</p>
        <p><span className="font-medium">Status:</span> {category.status ? 'Active' : 'Inactive'}</p>
      </div>

      <SheetFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex items-center justify-center"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={loading}
          onClick={handleDelete}
          className="flex items-center justify-center"
        >
          {loading ? "Deleting..." : "Delete Category"}
        </Button>
      </SheetFooter>
    </div>
  );
} 