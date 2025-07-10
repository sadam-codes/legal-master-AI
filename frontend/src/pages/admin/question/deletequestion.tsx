import  { useState } from "react";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import questionService, { Question } from "../../../services/question.service";

interface DeleteQuestionConfirmProps {
  question: Question;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeleteQuestionConfirm({ question, onSuccess, onCancel }: DeleteQuestionConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await questionService.deleteQuestion(question.id);
      Helpers.showToast('Question deleted successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error deleting question:", err);
      setError(err.response?.data?.message || "Failed to delete question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl">Delete Question</SheetTitle>
        <SheetDescription>
          Are you sure you want to delete this question?
        </SheetDescription>
      </SheetHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded">
        <p className="font-medium">Warning!</p>
        <p>This action cannot be undone. This will permanently delete the question "{question.title}".</p>
      </div>

      <div className="space-y-2">
        <p className="font-medium">Question details:</p>
        <p><span className="font-medium">Title:</span> {question.title}</p>
        <p><span className="font-medium">Category:</span> {question.category.name}</p>
        <p><span className="font-medium">Status:</span> {question.status ? 'Active' : 'Inactive'}</p>
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
          {loading ? "Deleting..." : "Delete Question"}
        </Button>
      </SheetFooter>
    </div>
  );
} 