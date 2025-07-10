//@ts-nocheck
import  { useEffect, useState, useCallback } from "react";
import { User } from "../../../types/types";
import { Button } from "../../../components/ui/button";
import { Edit, Plus, Trash2, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";
import { AddUserForm } from "./adduser";
import { EditUserForm } from "./edituser";
import { DeleteUserConfirm } from "./deleteuser";
import userService from "../../../services/user.service";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

export interface ExtendedUser extends User {
  username: string;
  isActive: boolean;
  isTwoFactorEnabled?: boolean;
  profileImage?: string;
}

export function UserTable() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await userService.getAllUsers();
      setUsers(users);
      setFilteredUsers(users);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(lowercasedQuery) ||
        user.username.toLowerCase().includes(lowercasedQuery) ||
        user.email.toLowerCase().includes(lowercasedQuery) ||
        user.role.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, users]);
  
  // Get paginated data
  const paginatedUsers = useCallback(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, pageSize]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  const onUserAdded = () => {
    setIsAddUserOpen(false);
    fetchUsers();
  };

  const onUserEdited = () => {
    setIsEditUserOpen(false);
    fetchUsers();
  };

  const onUserDeleted = () => {
    setIsDeleteUserOpen(false);
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <Sheet open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </SheetTrigger>
          <SheetContent>
            <AddUserForm onSuccess={onUserAdded} onCancel={() => setIsAddUserOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          className="pl-10 w-full md:w-64"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b">Name</th>
                  <th className="text-left p-3 border-b">Username</th>
                  <th className="text-left p-3 border-b">Email</th>
                  <th className="text-left p-3 border-b">Role</th>
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-center p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
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
                      <td className="p-3 border-b">{user.username}</td>
                      <td className="p-3 border-b">{user.email}</td>
                      <td className="p-3 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-blue-50 text-blue-800' 
                            : 'bg-gray-50 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-red-50 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 border-b flex justify-center gap-2">
                        <Sheet open={isEditUserOpen && selectedUser?.id === user.id} onOpenChange={(open) => !open && setIsEditUserOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            {selectedUser && (
                              <EditUserForm 
                                user={selectedUser} 
                                onSuccess={onUserEdited} 
                                onCancel={() => setIsEditUserOpen(false)} 
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                        
                        <Sheet open={isDeleteUserOpen && selectedUser?.id === user.id} onOpenChange={(open) => !open && setIsDeleteUserOpen(false)}>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            {selectedUser && (
                              <DeleteUserConfirm 
                                user={selectedUser} 
                                onSuccess={onUserDeleted} 
                                onCancel={() => setIsDeleteUserOpen(false)} 
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
    </div>
  );
}

export default UserTable;
