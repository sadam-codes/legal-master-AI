import  { useState } from "react";
import { Button } from "../../../components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import { ExtendedUser } from "./usertable";
import userService from "../../../services/user.service";

interface DeleteUserConfirmProps {
  user: ExtendedUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeleteUserConfirm({ user, onSuccess, onCancel }: DeleteUserConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== user.username) {
      setError("Please enter the username correctly to confirm deletion");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await userService.deleteUser(user.id);
      Helpers.showToast('User deleted successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl text-red-600">Delete User</SheetTitle>
        <SheetDescription>
          You are about to delete the user account for {user.name} ({user.email})
        </SheetDescription>
      </SheetHeader>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">Warning!</p>
            <p className="text-sm text-amber-700">
              This action cannot be undone. This will permanently delete the user and all associated data.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="confirm" className="text-sm font-medium">
            Please type <span className="font-bold">{user.username}</span> to confirm deletion
          </label>
          <input
            id="confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder={user.username}
          />
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
            disabled={loading || confirmText !== user.username}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
          >
            {loading ? "Deleting..." : "Delete User"}
          </Button>
        </SheetFooter>
      </div>
    </div>
  );
}
