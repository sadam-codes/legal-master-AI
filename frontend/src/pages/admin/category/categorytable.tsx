//@ts-nocheck
import  { useEffect, useState, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";
import categoryService, { Category } from "../../../services/category.service";
import { AddCategoryForm } from "./addcategory";
import { EditCategoryForm } from "./editcategory";
import { DeleteCategoryConfirm } from "./deletecategory";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";

export function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categories = await categoryService.getAllCategories();
      setCategories(categories.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Get paginated data
  const paginatedCategories = useCallback(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return categories.slice(start, end);
  }, [categories, currentPage, pageSize]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddCategory = () => {
    setIsAddCategoryOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const onCategoryAdded = () => {
    setIsAddCategoryOpen(false);
    fetchCategories();
  };

  const onCategoryEdited = () => {
    setIsEditCategoryOpen(false);
    fetchCategories();
  };

  const onCategoryDeleted = () => {
    setIsDeleteCategoryOpen(false);
    fetchCategories();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Category Management</h2>
        <Sheet open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAddCategory} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </SheetTrigger>
          <SheetContent>
            <AddCategoryForm onSuccess={onCategoryAdded} onCancel={() => setIsAddCategoryOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b">Name</th>
                  <th className="text-left p-3 border-b">Description</th>
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-center p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  paginatedCategories().map((category) => (
                    <tr key={category.id} className="hover:bg-muted/50">
                      <td className="p-3 border-b">{category.name}</td>
                      <td className="p-3 border-b">{category.description}</td>
                      <td className="p-3 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.status 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-red-50 text-red-800'
                        }`}>
                          {category.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 border-b flex justify-center gap-2">
                        <Sheet open={isEditCategoryOpen && selectedCategory?.id === category.id} onOpenChange={(open) => !open && setIsEditCategoryOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            {selectedCategory && (
                              <EditCategoryForm 
                                category={selectedCategory} 
                                onSuccess={onCategoryEdited} 
                                onCancel={() => setIsEditCategoryOpen(false)} 
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                        
                        <Sheet open={isDeleteCategoryOpen && selectedCategory?.id === category.id} onOpenChange={(open) => !open && setIsDeleteCategoryOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            {selectedCategory && (
                              <DeleteCategoryConfirm 
                                category={selectedCategory} 
                                onSuccess={onCategoryDeleted} 
                                onCancel={() => setIsDeleteCategoryOpen(false)} 
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
          
          {categories.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center">
              <PaginationInfo 
                totalItems={categories.length}
                pageSize={pageSize}
                currentPage={currentPage}
              />
              <Pagination
                totalItems={categories.length}
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

export default CategoryTable; 