import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LegalQuestionnaireData } from '@/services/chat.service';

interface LegalQuestionnaireProps {
  onSubmit: (formData: LegalQuestionnaireData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const LegalQuestionnaire = ({ onSubmit, onBack, isLoading = false }: LegalQuestionnaireProps) => {
  const [formData, setFormData] = useState<LegalQuestionnaireData>({
    country: '',
    state: '',
    role: 'plaintiff',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold">Legal Questionnaire</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Help us understand your legal situation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-border bg-card rounded-lg shadow-md p-5">
        <div className="space-y-4">
          {/* Country */}
          <div className="space-y-1">
            <label htmlFor="country" className="block text-sm font-medium">Country</label>
            <input
              id="country"
              type="text"
              name="country"
              className="w-full p-2 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
              placeholder="Your country of residence"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>

          {/* State */}
          <div className="space-y-1">
            <label htmlFor="state" className="block text-sm font-medium">State/Province</label>
            <input
              id="state"
              type="text"
              name="state"
              className="w-full p-2 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
              placeholder="Your state or province"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label htmlFor="role" className="block text-sm font-medium">Your Role</label>
            <select
              id="role"
              name="role"
              className="w-full p-2 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="plaintiff">Plaintiff</option>
              <option value="defendant">Defendant</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              className="w-full p-2 text-sm border border-input rounded-md h-24 bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
              placeholder="Describe what happened, who was involved, and when..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            size="sm"
          >
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></span>
                <span>Processing...</span>
              </span>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LegalQuestionnaire; 