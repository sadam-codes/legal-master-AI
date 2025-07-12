import api from "./api";

// Define types for responses and requests
interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  role: string;
  isTwoFactorEnabled?: boolean;
  profileImage?: string;
}

interface LoginRequest {
  username: string; // Can be username or email
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

interface UpdateProfileRequest {
  name: string;
  email?: string;
  username: string;
  profileImage?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
}

// Authentication Service
const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    
    // Store token in localStorage for API interceptor
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post("/users", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Clear token from localStorage regardless of API response
      localStorage.removeItem("token");
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile");
    return response.data.user;
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh", { refreshToken });
    
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  },
  
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put("/auth/profile", data);
    return response.data.user;
  },
  
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post("/auth/forgot-password", data);
  },
  
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post("/auth/reset-password", data);
  },
};

export default authService;
