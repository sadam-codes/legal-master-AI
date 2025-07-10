//@ts-nocheck

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Clock, Plus, Trash2, AlertCircle, MoreVertical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import chatService, { Chat } from '@/services/chat.service';
import { cn } from '@/lib/utils';
import { eventEmitter } from '@/lib/eventEmitter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface ChatHistorySidebarProps {
  collapsed?: boolean;
  className?: string;
}

export function ChatHistorySidebar({ collapsed = false, className }: ChatHistorySidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { chatId: currentChatId } = useParams();

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await chatService.getUserChats();
      setChats(response.data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    
    // Set up event listener for chat creation
    const handleChatCreated = () => {
      console.log('Chat created event received, refreshing chat list');
      fetchChats();
    };
    
    // Subscribe to the chatCreated event
    eventEmitter.on('chatCreated', handleChatCreated);
    
    // Cleanup function to remove event listener
    return () => {
      eventEmitter.off('chatCreated', handleChatCreated);
    };
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today, show time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter chats based on ID since there's no title
  const filteredChats = searchTerm.trim() === '' 
    ? chats 
    : chats.filter(chat => chat.id.toLowerCase().includes());

  const handleNewChat = () => {
 
    navigate(`/chat/new`, { state: { stage: 'category_selection' } });
  };

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return;
    
    try {
      await chatService.deleteChat(chatToDelete);
      
      // Remove the chat from the local state
      setChats(prev => prev.filter(chat => chat.id !== chatToDelete));
      
      // Show success toast
      toast({
        title: "Chat deleted",
        description: "Your chat has been successfully deleted.",
        duration: 3000,
      });
      
      // If we deleted the current chat, navigate to the new chat page
      if (chatToDelete === currentChatId) {
        navigate('/chat/new', { state: { stage: 'category_selection', flag: true } });
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete the chat. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    // Close the dialog
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  const handleRenameClick = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChatId || !editingTitle.trim()) return;

    const chat = chats.find(c => c.id === editingChatId);
    if (!chat || chat.title === editingTitle.trim()) {
      setEditingChatId(null);
      setEditingTitle('');
      return;
    }

    try {
      await chatService.renameChat(editingChatId, editingTitle.trim());
      
      // Update the chat in the local state
      setChats(prev => prev.map(chat => 
        chat.id === editingChatId 
          ? { ...chat, title: editingTitle.trim() }
          : chat
      ));
      
      toast({
        title: "Chat renamed",
        description: "Your chat has been successfully renamed.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to rename chat:', error);
      toast({
        title: "Error",
        description: "Failed to rename the chat. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    setEditingChatId(null);
    setEditingTitle('');
  };

  return (
    <>
      <div className={cn('flex flex-col h-full', className)}>
        {!collapsed && (
          <div className="p-3 border-b border-border">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-[#BB8A28] hover:bg-[#9A7020] flex items-center gap-2"
            >
              <Plus size={16} />
              <span>New Chat</span>
            </Button>
        
          </div>
        )}
        
        {collapsed && (
          <Button
            onClick={handleNewChat}
            className="mx-auto my-3 bg-[#BB8A28] hover:bg-[#9A7020] h-9 w-9 p-0"
            title="New Chat"
          >
            <Plus size={16} />
          </Button>
        )}
        
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#BB8A28] border-t-transparent"></div>
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-1 px-2">
              {filteredChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className={cn(
                    'group flex items-center rounded-md text-sm transition-colors relative',
                    chat.id === currentChatId ? 'bg-muted' : 'hover:bg-muted/50',
                    collapsed ? 'justify-center p-2' : 'py-2 px-3'
                  )}
                >
                  <MessageSquare 
                    className={cn(
                      'flex-shrink-0',
                      collapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'
                    )} 
                  />
                  
                  {!collapsed && (
                    <>
                      <div className="flex-1 truncate">
                        {editingChatId === chat.id ? (
                          <form onSubmit={handleRenameSubmit} className="flex items-center gap-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onBlur={handleRenameSubmit}
                            />
                          </form>
                        ) : (
                          <>
                            <div className="font-medium truncate">
                              {chat.title === 'Chat' ? `Chat ${chat.id}` : chat.title.charAt(0).toUpperCase() + chat.title.slice(1)}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(chat.createdAt)}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <DropdownMenu open={openDropdownId === chat.id} onOpenChange={(open) => {
                        setOpenDropdownId(open ? chat.id : null);
                      }}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => handleRenameClick(chat.id, chat.title, e)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => handleDeleteClick(chat.id, e)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className={cn(
              'text-center text-muted-foreground',
              collapsed ? 'p-2' : 'p-4'
            )}>
              {!collapsed && (
                <>
                  <p className="text-sm">No chat history found</p>
                  <p className="text-xs mt-1">Start a new conversation</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Chat
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ChatHistorySidebar; 