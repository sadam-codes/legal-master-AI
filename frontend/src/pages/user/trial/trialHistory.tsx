import  { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import trialService from "../../../services/trial.service";
import Helpers from "../../../config/helpers";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";

interface Trial {
  id: string;
  caseData: {
    caseDescription: string;
    role: string;
    country: string;
    state: string;
  }
  caseAnalysis: string;
  summary: string;
  status: string;
  createdAt: string;
}

const TrialHistory = () => {
  const navigate = useNavigate();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchTrials();
  }, []);

  const fetchTrials = async () => {
    setLoading(true);
    try {
      const response = await trialService.getUserTrials();
      if (response.success && response.trials) {
        setTrials(response.trials);
      } else {
        Helpers.showToast("Failed to load trial history", "error");
      }
    } catch (error) {
      console.error("Error fetching trial history:", error);
      Helpers.showToast("Failed to load trial history", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = (trial: Trial) => {
    setSelectedTrial(trial);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mock Trial History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your previously submitted mock trials
          </p>
        </div>
        <Button
          onClick={() => navigate('/user/trial')}
          variant="outline"
          size="sm"
        >
          New Mock Trial
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">
            <p>Loading your trial history...</p>
          </div>
        </div>
      ) : trials.length === 0 ? (
        <Card className="border border-border bg-card shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-4">No mock trials found</p>
            <p className="text-muted-foreground mb-6">You haven't submitted any mock trial cases yet.</p>
            <Button onClick={() => navigate('/user/trial')}>
              Submit Your First Mock Trial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trials.map((trial) => (
            <Card key={trial.id} className="border border-border bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {trial.caseData.caseDescription}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize">{trial.caseData.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{trial.caseData.state}, {trial.caseData.country}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${trial.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}`}>
                      {trial.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(trial.createdAt)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleViewAnalysis(trial)}
                  className="w-full"
                  size="sm"
                >
                  View Analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTrial && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTrial.caseData.caseDescription}</DialogTitle>
                <DialogDescription>
                  {selectedTrial.caseData.role} | {selectedTrial.caseData.state}, {selectedTrial.caseData.country}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Case Summary</h3>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedTrial.summary}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Case Analysis</h3>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedTrial.caseAnalysis}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrialHistory; 