import api from "./api";

interface MockTrialFormData {
  caseDescription: string;
  role: 'plaintiff' | 'defendant' | 'other';
  country: string;
  state: string;
  files: FileList | null;
}

interface TrialResponse {
  success: boolean;
  analysis?: string;
  message?: string;
  trialId?: string;
}

interface TrialsResponse {
  success: boolean;
  trials?: any[];
  message?: string;
}

const trialService = {
  /**
   * Submit a mock trial for AI analysis
   * @param formData Mock trial form data
   * @returns Promise with the analysis response
   */
  submitMockTrial: async (formData: MockTrialFormData): Promise<TrialResponse> => {
    const { files, ...textData } = formData;
    
    // If there are no files, send a regular JSON request
    if (!files || files.length === 0) {
      const response = await api.post("/trials", textData);
      return response.data;
    }
    
    // If there are files, use FormData to send a multipart request
    const formDataObj = new FormData();
    
    // Append text fields
    Object.entries(textData).forEach(([key, value]) => {
      formDataObj.append(key, value as string);
    });
    
    // Append files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formDataObj.append("files", files[i]);
      }
    }
    
    // Send multipart request with files
    const response = await api.post("/trials", formDataObj, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
  },

  /**
   * Analyze trial files for both plaintiff and defendant
   * @param formData FormData containing trialId, plaintiffFiles, and defendantFiles
   * @returns Promise with the analysis response
   */
  analyzeTrialFiles: async (formData: FormData): Promise<TrialResponse> => {
    const response = await api.post("/trials/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get all mock trials for the current user
   * @returns Promise with the user's trials
   */
  getUserTrials: async (): Promise<TrialsResponse> => {
    const response = await api.get("/trials/user");
    return response.data;
  },

  /**
   * Admin only: Get all mock trials in the system
   * @returns Promise with all trials
   */
  getAllTrials: async (): Promise<TrialsResponse> => {
    const response = await api.get("/trials/admin/all");
    return response.data;
  },
};

export default trialService;
