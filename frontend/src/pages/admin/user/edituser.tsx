import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import { UserRole } from "../../../types/types";
import { ExtendedUser } from "./usertable";
import userService from "../../../services/user.service";

interface EditUserFormProps {
  user: ExtendedUser;
  onSuccess: () => void;
  onCancel: () => void;
}

interface UserEditPayload {
  name: string;
  email: string;
  username: string;
  role: keyof typeof UserRole;
  isActive: boolean;
  password?: string;
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role as keyof typeof UserRole,
    isActive: user.isActive,
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Create payload without password if it's empty
    const payload: UserEditPayload = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      role: formData.role,
      isActive: formData.isActive
    };
    
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      await userService.updateUser(user.id, payload);
      Helpers.showToast('User updated successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || "Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl">Edit User</SheetTitle>
        <SheetDescription>
          Edit user details for {user.name} ({user.email})
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
            Full Name
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
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="text-xs"
            >
              {isPasswordVisible ? "Cancel" : "Change Password"}
            </Button>
          </div>
          
          {isPasswordVisible && (
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="New password"
            />
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
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
            Account Active
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
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </form>
    </div>
  );
}
