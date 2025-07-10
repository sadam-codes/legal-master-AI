import api from "./api";
import { ExtendedUser } from "../pages/admin/user/usertable";
import { UserRole } from "../types/types";

interface CreateUserData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: keyof typeof UserRole;
  isActive: boolean;
}

interface UpdateUserData {
  name: string;
  email: string;
  username: string;
  role: keyof typeof UserRole;
  isActive: boolean;
  password?: string;
}

// User Service
const userService = {
  getAllUsers: async (): Promise<ExtendedUser[]> => {
    const response = await api.get("/users");
    return response.data.users;
  },

  getUserById: async (id: string): Promise<ExtendedUser> => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  createUser: async (userData: CreateUserData): Promise<ExtendedUser> => {
    const response = await api.post("/users", userData);
    return response.data.user;
  },

  updateUser: async (id: string, userData: UpdateUserData): Promise<ExtendedUser> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default userService; 