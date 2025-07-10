//@ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import trialService from "@/services/trial.service";
import userService from "@/services/user.service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as Dialog from "@radix-ui/react-dialog";
import ReactMarkdown from "react-markdown";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";

interface Trial {
  id: string;
  caseData: {
    caseDescription: string;
    role: string;
    country: string;
    state: string;
  };
  caseAnalysis: string;
  summary: string;
  filesUrl: string[] | null;
  userId: number;
  createdAt: string;
}

export function TrialsTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [userTrials, setUserTrials] = useState<Record<string, Trial[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrialDetailsOpen, setIsTrialDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const fetchUsersAndTrials = async () => {
    setLoading(true);
    try {
      // Get all users
      const users = await userService.getAllUsers();
      setUsers(users);
      
      // Get all trials
      const response = await trialService.getAllTrials();
      
      // Group trials by user ID
      if (response.success && response.trials) {
        const userTrialsMap: Record<string, Trial[]> = {};
        
        for (const user of users) {
          // Filter trials for this user
          const userTrialsList = response.trials.filter(trial => trial.userId === user.id);
          userTrialsMap[user.id] = userTrialsList;
        }
        
        setUserTrials(userTrialsMap);
      } else {
        setError("Failed to fetch trials data");
      }
    } catch (err) {
      console.error("Error fetching users and trials:", err);
      setError("Failed to fetch users and trials data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndTrials();
  }, []);

  // Filter and paginate users
  useEffect(() => {
    const filtered = users.filter(user => userTrials[user.id]?.length > 0);
    setFilteredUsers(filtered);
  }, [users, userTrials]);
  
  // Get paginated data
  const paginatedUsers = useCallback(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, pageSize]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewUserTrials = (user: User) => {
    setSelectedUser(user);
    setIsTrialDetailsOpen(true);
  };

  const handleViewAnalysis = (trial: Trial) => {
    setSelectedTrial(trial);
    setIsAnalysisModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Mock Trials Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading users and trials...</div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b">User</th>
                  <th className="text-left p-3 border-b">Email</th>
                  <th className="text-center p-3 border-b">Total Trials</th>
                  <th className="text-center p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="p-3 border-b">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.name} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {user.name}
                        </div>
                      </td>
                      <td className="p-3 border-b">{user.email}</td>
                      <td className="p-3 border-b text-center">
                        {userTrials[user.id]?.length || 0}
                      </td>
                      <td className="p-3 border-b flex justify-center">
                        <Sheet open={isTrialDetailsOpen && selectedUser?.id === user.id} onOpenChange={(open) => !open && setIsTrialDetailsOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewUserTrials(user)}
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View Trials
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                {user.name}'s Mock Trials
                              </h3>
                              
                              {!userTrials[user.id] || userTrials[user.id].length === 0 ? (
                                <div className="text-center py-8">
                                  No mock trials found for this user
                                </div>
                              ) : (
                                <Accordion type="single" collapsible>
                                  {userTrials[user.id].map((trial) => (
                                    <AccordionItem value={trial.id} key={trial.id}>
                                      <AccordionTrigger className="px-4 py-2 hover:bg-muted/50 rounded-md">
                                        <div className="flex justify-between items-center w-full">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="truncate max-w-[200px]">{trial.caseData.caseDescription}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>Role: {trial.caseData.role}</span>
                                            <span>Created: {formatDate(trial.createdAt)}</span>
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="p-4 space-y-4">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <span className="font-medium">Country: </span>
                                              {trial.caseData.country}
                                            </div>
                                            <div>
                                              <span className="font-medium">State: </span>
                                              {trial.caseData.state}
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <h4 className="font-medium">Summary</h4>
                                            <p className="text-sm max-h-24 overflow-y-auto p-2 bg-muted/50 rounded">
                                              {trial.summary?.substring(0, 200)}...
                                            </p>
                                          </div>
                                          
                                          <div className="flex justify-end">
                                            <Button 
                                              variant="default" 
                                              size="sm" 
                                              onClick={() => handleViewAnalysis(trial)}
                                            >
                                              View Complete Analysis
                                            </Button>
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center">
              <PaginationInfo 
                totalItems={filteredUsers.length}
                pageSize={pageSize}
                currentPage={currentPage}
              />
              <Pagination
                totalItems={filteredUsers.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Analysis Modal */}
      <Dialog.Root open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 shadow-lg z-50 flex flex-col">
            <Dialog.Title className="text-xl font-semibold mb-4 flex justify-between items-center">
              {selectedTrial && (
                <div className="truncate max-w-[700px]">
                  {selectedTrial.caseData.caseDescription}
                </div>
              )}
              <Dialog.Close className="rounded-full p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </Dialog.Title>
            
            <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-4 space-y-3 max-h-[60vh]">
              {selectedTrial ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm p-2 bg-muted/30 rounded">
                    <div>
                      <span className="font-medium">Role: </span>
                      {selectedTrial.caseData.role}
                    </div>
                    <div>
                      <span className="font-medium">Location: </span>
                      {selectedTrial.caseData.state}, {selectedTrial.caseData.country}
                    </div>
                    <div>
                      <span className="font-medium">Created: </span>
                      {formatDate(selectedTrial.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Files: </span>
                      {selectedTrial.filesUrl && selectedTrial.filesUrl.length > 0 
                        ? `${selectedTrial.filesUrl.length} file(s)` 
                        : 'No files'}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Case Analysis</h4>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {selectedTrial.caseAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">Loading analysis...</div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default TrialsTable;
