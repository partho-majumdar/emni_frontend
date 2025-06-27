"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { MessageCircle, Send, MoreVertical, Trash2, Edit3, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  message_text: string;
  is_deleted: boolean;
  sent_at: string;
  is_read: boolean;
  read_at: string | null;
}

interface Conversation {
  conversation_id: string;
  student: {
    student_id: string;
    user_id: string;
    name: string;
    profileImage?: string | null;
    username?: string; // Made optional to handle missing usernames
  };
  mentor: {
    mentor_id: string;
    user_id: string;
    name: string;
  };
  last_message_text: string | null;
  last_message_at: string | null;
  unread_count: number;
  messages?: Message[];
}

interface ApiResponse {
  success: boolean;
  data: Conversation[] | Conversation | Message;
  message?: string;
}

const getAvatar = (username: string): string => {
  return `https://robohash.org/${username}.png?size=120x120`;
};

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error(`Invalid date string: ${dateString}`);
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid Date";
  }
};

const MentorInbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const request: ApiRequestType = {
          endpoint: "api/messages/conversations",
          method: "GET",
          auth: true,
        };
        const response = await apiRequest(request) as ApiResponse;
        if (response.success) {
          setConversations(response.data as Conversation[]);
        } else {
          throw new Error(response.message || "Failed to fetch conversations");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An error occurred while fetching conversations";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation && !selectedConversation.messages) {
      const fetchMessages = async () => {
        try {
          const request: ApiRequestType = {
            endpoint: `api/messages/conversations/student/${selectedConversation.student.student_id}`,
            method: "GET",
            auth: true,
          };
          const response = await apiRequest(request) as ApiResponse;
          if (response.success) {
            setSelectedConversation(response.data as Conversation);
            setConversations((prev) =>
              prev.map((conv) =>
                conv.conversation_id === (response.data as Conversation).conversation_id
                  ? { ...conv, messages: (response.data as Conversation).messages }
                  : conv
              )
            );
            markMessagesAsRead((response.data as Conversation).conversation_id);
          } else {
            throw new Error(response.message || "Failed to fetch messages");
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "An error occurred while fetching messages";
          toast.error(message);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (chatContainerRef.current && selectedConversation?.messages) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedConversation?.messages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      if (editingMessageId) {
        const request: ApiRequestType = {
          endpoint: `api/messages/messages/${editingMessageId}`,
          method: "PUT",
          auth: true,
          body: { message_text: messageText.trim() },
        };
        const response = await apiRequest(request) as ApiResponse;
        if (response.success) {
          toast.success("Message updated successfully");
          setSelectedConversation({
            ...selectedConversation,
            messages: selectedConversation.messages!.map((msg) =>
              msg.message_id === editingMessageId
                ? { ...msg, message_text: messageText.trim(), sent_at: (response.data as Message).sent_at }
                : msg
            ),
          });
          setConversations((prev) =>
            prev.map((conv) =>
              conv.conversation_id === selectedConversation.conversation_id
                ? {
                    ...conv,
                    last_message_text: messageText.trim(),
                    last_message_at: (response.data as Message).sent_at,
                  }
                : conv
            )
          );
          setMessageText("");
          setEditingMessageId(null);
        } else {
          throw new Error(response.message || "Failed to update message");
        }
      } else {
        const request: ApiRequestType = {
          endpoint: `api/messages/messages/${selectedConversation.conversation_id}`,
          method: "POST",
          auth: true,
          body: { message_text: messageText.trim() },
        };
        const response = await apiRequest(request) as ApiResponse;
        if (response.success) {
          const newMessage = response.data as Message;
          setSelectedConversation({
            ...selectedConversation,
            messages: [...(selectedConversation.messages || []), newMessage],
          });
          setConversations((prev) =>
            prev.map((conv) =>
              conv.conversation_id === selectedConversation.conversation_id
                ? {
                    ...conv,
                    last_message_text: newMessage.message_text,
                    last_message_at: newMessage.sent_at,
                    unread_count: 0,
                  }
                : conv
            )
          );
          setMessageText("");
        } else {
          throw new Error(response.message || "Failed to send message");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while processing message";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = (messageId: string, messageText: string) => {
    setMessageText(messageText);
    setEditingMessageId(messageId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;

    setIsSending(true);
    try {
      const request: ApiRequestType = {
        endpoint: `api/messages/messages/${messageId}`,
        method: "DELETE",
        auth: true,
      };
      const response = await apiRequest(request) as ApiResponse;
      if (response.success) {
        toast.success("Message deleted successfully");
        setSelectedConversation({
          ...selectedConversation,
          messages: selectedConversation.messages!.map((msg) =>
            msg.message_id === messageId ? { ...msg, is_deleted: true, message_text: "[Deleted]" } : msg
          ),
        });
      } else {
        throw new Error(response.message || "Failed to delete message");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while deleting message";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const cancelEdit = () => {
    setMessageText("");
    setEditingMessageId(null);
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const request: ApiRequestType = {
        endpoint: `api/messages/conversations/${conversationId}/read`,
        method: "PUT",
        auth: true,
      };
      const response = await apiRequest(request) as ApiResponse;
      if (response.success) {
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages?.map((msg) => ({
                  ...msg,
                  is_read: true,
                  read_at: msg.is_read ? msg.read_at : new Date().toISOString(),
                })),
              }
            : null
        );
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === conversationId ? { ...conv, unread_count: 0 } : conv
          )
        );
      }
    } catch (err: unknown) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-16 h-16 border-4 border-slate-700 border-t-amber-500/80 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-slate-600 border-b-orange-400/60 rounded-full"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h3 className="text-white font-semibold mb-2">Loading Inbox</h3>
            <p className="text-slate-400 text-sm">
              Fetching your conversations...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-8 max-w-md w-full shadow-xl"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-orange-500/30 flex items-center justify-center">
              <X className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">Error</h3>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-400 transition-all duration-300"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl"
        />
      </div>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Conversation List */}
        {/* <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/3 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] flex flex-col"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Conversations</h2>
          <ScrollArea className="flex-1 [&::-webkit-scrollbar]:bg-gray-900/50">
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full">
                  <MessageCircle className="w-16 h-16 text-orange-400 mb-4 opacity-50" />
                  <p className="text-gray-300 text-lg text-center">No conversations yet.</p>
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <motion.div
                    key={conv.conversation_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 rounded-xl cursor-pointer flex items-center gap-4 ${
                      selectedConversation?.conversation_id === conv.conversation_id
                        ? "bg-orange-500/20 border-orange-500/30"
                        : "bg-gray-700/50 hover:bg-gray-700/70"
                    } border border-gray-500/30 transition-all duration-300`}
                  >
                    <img
                      src={conv.student.profileImage || getAvatar(conv.student.username || conv.student.name)}
                      alt={`${conv.student.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                      onError={(e) => {
                        e.currentTarget.src = getAvatar(conv.student.name + "-fallback");
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-white">
                          {conv.student.name} ({conv.student.username ? `@${conv.student.username}` : "No username"})
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="bg-orange-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {conv.last_message_text || "No messages yet"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conv.last_message_at ? formatDateTime(conv.last_message_at) : ""}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/3 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] flex flex-col"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Conversations</h2>
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="h-full">
              <div className="space-y-3 pr-3"> {/* Added pr-3 to prevent content from touching scrollbar */}
                {conversations.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <MessageCircle className="w-16 h-16 text-orange-400 mb-4 opacity-50" />
                    <p className="text-gray-300 text-lg text-center">No conversations yet.</p>
                  </div>
                ) : (
                  conversations.map((conv, index) => (
                    <motion.div
                      key={conv.conversation_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 rounded-xl cursor-pointer flex items-center gap-4 ${
                        selectedConversation?.conversation_id === conv.conversation_id
                          ? "bg-orange-500/20 border-orange-500/30"
                          : "bg-gray-700/50 hover:bg-gray-700/70"
                      } border border-gray-500/30 transition-all duration-300`}
                    >
                      <img
                        src={conv.student.profileImage || getAvatar(conv.student.username || conv.student.name)}
                        alt={`${conv.student.name}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                        onError={(e) => {
                          e.currentTarget.src = getAvatar(conv.student.name + "-fallback");
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-white">
                            {conv.student.name} ({conv.student.username ? `@${conv.student.username}` : "No username"})
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {conv.last_message_text || "No messages yet"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conv.last_message_at ? formatDateTime(conv.last_message_at) : ""}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-2/3 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] flex flex-col"
        >
          {selectedConversation ? (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-orange-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <img
                      src={selectedConversation.student.profileImage || getAvatar(selectedConversation.student.username || selectedConversation.student.name)}
                      alt={`${selectedConversation.student.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                      onError={(e) => {
                        e.currentTarget.src = getAvatar(selectedConversation.student.name + "-fallback");
                        e.currentTarget.onerror = null;
                      }}
                    />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedConversation.student.name}
                    </h3>
                    {selectedConversation.student.username && (
                      <p className="text-sm text-gray-400">
                        @{selectedConversation.student.username}
                      </p>
                    )}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedConversation(null);
                    cancelEdit();
                  }}
                  className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center text-white hover:bg-orange-500/50 transition-all"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-6 px-2 [&::-webkit-scrollbar]:bg-gray-900/50"
              >
                <div className="space-y-4">
                  {selectedConversation.messages?.length ? (
                    selectedConversation.messages.map((msg, index) => (
                      <motion.div
                        key={`message-${msg.message_id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${msg.sender_type === "Mentor" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="relative max-w-[70%] group">
                          <div
                            className={`p-4 rounded-xl ${
                              msg.sender_type === "Mentor"
                                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                : "bg-gray-700/50 text-gray-300 border-gray-500/30"
                            } border shadow-sm`}
                          >
                            <p className="text-sm leading-relaxed">{msg.message_text}</p>
                            <span className="text-xs text-gray-400 block mt-2">
                              {formatDateTime(msg.sent_at)}
                              {msg.sender_type === "Mentor" && msg.is_read && (
                                <span className="ml-2 text-orange-400">✓</span>
                              )}
                            </span>
                            {msg.sender_type === "Mentor" && !msg.is_deleted && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-orange-400 p-2 rounded-lg hover:bg-gray-800/50"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </motion.button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  className="w-44 bg-gray-900/95 backdrop-blur-xl border border-orange-500/20 rounded-xl shadow-2xl"
                                  align="end"
                                >
                                  <DropdownMenuItem
                                    className="flex items-center space-x-3 hover:bg-gray-800/50 cursor-pointer rounded-lg px-3 py-2 m-1"
                                    onClick={() => handleEditMessage(msg.message_id, msg.message_text)}
                                  >
                                    <Edit3 className="w-4 h-4 text-orange-400" />
                                    <span className="text-white">Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center space-x-3 text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg px-3 py-2 m-1"
                                    onClick={() => handleDeleteMessage(msg.message_id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center h-full">
                      <MessageCircle className="w-16 h-16 text-orange-400 mb-4 opacity-50" />
                      <p className="text-gray-300 text-lg text-center">
                        Start your conversation with {selectedConversation.student.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-700/50 rounded-xl p-3 border border-orange-500/30">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
                  placeholder={editingMessageId ? "Edit your message..." : "Type your message..."}
                  className="flex-1 p-3 bg-transparent text-gray-300 rounded-lg focus:outline-none focus:ring-0"
                  disabled={isSending}
                />
                {editingMessageId ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={isSending || !messageText.trim()}
                      className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelEdit}
                      className="p-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={isSending || !messageText.trim()}
                    className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageCircle className="w-16 h-16 text-orange-400 mb-4 opacity-50" />
              <p className="text-gray-300 text-lg text-center">Select a conversation to start chatting</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MentorInbox;
