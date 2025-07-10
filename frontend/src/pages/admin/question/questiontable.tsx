//@ts-nocheck
import  { useEffect, useState, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";

import questionService, { Question } from "../../../services/question.service";
import { AddQuestionForm } from "./addquestion";
import { EditQuestionForm } from "./editquestion";
import { DeleteQuestionConfirm } from "./deletequestion";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";

export function QuestionTable() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isDeleteQuestionOpen, setIsDeleteQuestionOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const questions = await questionService.getAllQuestions();
      setQuestions(questions.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);
  
  // Get paginated data
  const paginatedQuestions = useCallback(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return questions.slice(start, end);
  }, [questions, currentPage, pageSize]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddQuestion = () => {
    setIsAddQuestionOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditQuestionOpen(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsDeleteQuestionOpen(true);
  };

  const onQuestionAdded = () => {
    setIsAddQuestionOpen(false);
    fetchQuestions();
  };

  const onQuestionEdited = () => {
    setIsEditQuestionOpen(false);
    fetchQuestions();
  };

  const onQuestionDeleted = () => {
    setIsDeleteQuestionOpen(false);
    fetchQuestions();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Question Management</h2>
        <Sheet open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAddQuestion} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </SheetTrigger>
          <SheetContent>
            <AddQuestionForm onSuccess={onQuestionAdded} onCancel={() => setIsAddQuestionOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b">Title</th>
                  <th className="text-left p-3 border-b">Content</th>
                  <th className="text-left p-3 border-b">Category</th>
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-center p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      No questions found
                    </td>
                  </tr>
                ) : (
                  paginatedQuestions().map((question) => (
                    <tr key={question.id} className="hover:bg-muted/50">
                      <td className="p-3 border-b">{question.title}</td>
                      <td className="p-3 border-b">{question.content}</td>
                      <td className="p-3 border-b">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-800">
                          {question.category.name}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          question.status 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-red-50 text-red-800'
                        }`}>
                          {question.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 border-b flex justify-center gap-2">
                        <Sheet open={isEditQuestionOpen && selectedQuestion?.id === question.id} onOpenChange={(open) => !open && setIsEditQuestionOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            {selectedQuestion && (
                              <EditQuestionForm 
                                question={selectedQuestion} 
                                onSuccess={onQuestionEdited} 
                                onCancel={() => setIsEditQuestionOpen(false)} 
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                        
                        <Sheet open={isDeleteQuestionOpen && selectedQuestion?.id === question.id} onOpenChange={(open) => !open && setIsDeleteQuestionOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            {selectedQuestion && (
                              <DeleteQuestionConfirm 
                                question={selectedQuestion} 
                                onSuccess={onQuestionDeleted} 
                                onCancel={() => setIsDeleteQuestionOpen(false)} 
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {questions.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center">
              <PaginationInfo 
                totalItems={questions.length}
                pageSize={pageSize}
                currentPage={currentPage}
              />
              <Pagination
                totalItems={questions.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionTable; 