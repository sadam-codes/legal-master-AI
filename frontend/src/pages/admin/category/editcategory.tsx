import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import categoryService, { Category } from "../../../services/category.service";

interface EditCategoryFormProps {
  category: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditCategoryForm({ category, onSuccess, onCancel }: EditCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Populate form with category data when component mounts
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.status
    });
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await categoryService.updateCategory(category.id, formData);
      Helpers.showToast('Category updated successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error updating category:", err);
      setError(err.response?.data?.message || "Failed to update category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl">Edit Category</SheetTitle>
        <SheetDescription>
          Update the category information.
        </SheetDescription>
      </SheetHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Category Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active Category
          </label>
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
            type="submit"
            disabled={loading}
            className="flex items-center justify-center"
          >
            {loading ? "Updating..." : "Update Category"}
          </Button>
        </SheetFooter>
      </form>
    </div>
  );
} 