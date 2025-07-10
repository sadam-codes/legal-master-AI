import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import trialService from "../../../services/trial.service";
import Helpers from "../../../config/helpers";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { FileText, Upload, History } from "lucide-react";

interface MockTrialFormData {
  caseDescription: string;
  role: 'plaintiff' | 'defendant' | 'other';
  country: string;
  state: string;
  files: FileList | null;
}

const MockTrials = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MockTrialFormData>({
    caseDescription: '',
    role: 'plaintiff',
    country: '',
    state: '',
    files: null,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, files: e.target.files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await trialService.submitMockTrial(formData);
      Helpers.showToast(response.message || "Mock trial submitted successfully", "success");
      
      // Redirect to trial analysis page if successful
      if (response.success && response.trialId) {
        navigate(`/user/trial/analysis?trialId=${response.trialId}`);
      } else {
        // Reset form after successful submission if not redirecting
        setFormData({
          caseDescription: '',
          role: 'plaintiff',
          country: '',
          state: '',
          files: null,
        });
      }
    } catch (error: any) {
      console.error("Error submitting mock trial:", error);
      Helpers.showToast(error.response.data.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const navigateToHistory = () => {
    navigate('/user/trial/history');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mock Trial Case Submission</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Provide details about your case to proceed
          </p>
        </div>
        <Button
          onClick={navigateToHistory}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <History size={16} />
          View History
        </Button>
      </div>

      <Card className="border border-border bg-card rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Description */}
          <div className="space-y-2">
            <label htmlFor="caseDescription" className="block text-sm font-medium flex items-center gap-2">
              <FileText size={16} className="text-[#BB8A28]" />
              Case Description
            </label>
            <textarea
              id="caseDescription"
              name="caseDescription"
              className="w-full p-3 text-sm border border-input rounded-md h-32 bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
              placeholder="Describe your case in detail..."
              value={formData.caseDescription}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">Your Role</label>
              <select
                id="role"
                name="role"
                className="w-full p-3 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="plaintiff">Plaintiff</option>
                <option value="defendant">Defendant</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium">Country</label>
              <input
                id="country"
                type="text"
                name="country"
                className="w-full p-3 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
                placeholder="Your country of residence"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm font-medium">State/Province</label>
            <input
              id="state"
              type="text"
              name="state"
              className="w-full p-3 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
              placeholder="Your state or province"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="files" className="block text-sm font-medium flex items-center gap-2">
              <Upload size={16} className="text-[#BB8A28]" />
              Upload Files
            </label>
            <div className="border border-dashed border-input rounded-md p-4 bg-background/50">
              <input
                id="files"
                type="file"
                name="files"
                className="w-full text-sm focus:outline-none"
                onChange={handleFileChange}
                multiple
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload any relevant case documents, evidence, or legal materials
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              size="lg"
              className="bg-[#BB8A28] hover:bg-[#9A7123] text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Case"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MockTrials;
