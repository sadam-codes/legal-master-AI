import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import questionService, { Question } from "../../../services/question.service";
import categoryService, { Category } from "../../../services/category.service";

interface EditQuestionFormProps {
  question: Question;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditQuestionForm({ question, onSuccess, onCancel }: EditQuestionFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    isActive: true
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData.data);
        setFetchingCategories(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please refresh and try again.");
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Populate form with question data when component mounts
    if (question && !fetchingCategories) {
      setFormData({
        title: question.title,
        content: question.content,
        categoryId: question.category.id,
        isActive: question.status
      });
    }
  }, [question, fetchingCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.categoryId) {
      setError("Please select a category");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await questionService.updateQuestion(question.id, formData);
      Helpers.showToast('Question updated successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error updating question:", err);
      setError(err.response?.data?.message || "Failed to update question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl">Edit Question</SheetTitle>
        <SheetDescription>
          Update the question information.
        </SheetDescription>
      </SheetHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {fetchingCategories ? (
        <div className="text-center py-4">Loading categories...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Question Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Question Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a category</option>
              {categories.length === 0 ? (
                <option value="" disabled>No categories available</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
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
              Active Question
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
              disabled={loading || categories.length === 0}
              className="flex items-center justify-center"
            >
              {loading ? "Updating..." : "Update Question"}
            </Button>
          </SheetFooter>
        </form>
      )}
    </div>
  );
} 