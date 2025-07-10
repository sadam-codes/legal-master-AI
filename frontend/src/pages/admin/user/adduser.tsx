import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../../components/ui/sheet";
import Helpers from "../../../config/helpers";
import { UserRole } from "../../../types/types";
import userService from "../../../services/user.service";

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user" as keyof typeof UserRole,
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      await userService.createUser(formData);
      Helpers.showToast('User created successfully', 'success');
      onSuccess();
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-xl">Add New User</SheetTitle>
        <SheetDescription>
          Create a new user account with the following information.
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
            placeholder="John Doe"
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
            placeholder="john@example.com"
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
            placeholder="johndoe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="••••••••"
          />
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
            {loading ? "Creating..." : "Create User"}
          </Button>
        </SheetFooter>
      </form>
    </div>
  );
}
