import api from "./api";
import { Pagination } from "@/types/types";


export interface CategoryResponse { 
  data: Category[];
  pagination: Pagination;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryData {
  name: string;
  description: string;
  isActive: boolean;
}

interface UpdateCategoryData {
  name: string;
  description: string;
  isActive: boolean;
}

// Category Service
const categoryService = {
  getAllCategories: async (): Promise<CategoryResponse> => {
    try {
      const response = await api.get("/categories");
      // Make sure we're returning the expected structure
      if (response.data && response.data.data) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        // If the API returns an array directly, reformat it
        return {
          data: response.data,
          pagination: {
            page: 1,
            limit: response.data.length,
            pages: 1,
            total: response.data.length
          }
        };
      } else {
        console.error('Unexpected API response format:', response.data);
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            pages: 0,
            total: 0
          }
        };
      }
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: CreateCategoryData): Promise<Category> => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: UpdateCategoryData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService; 