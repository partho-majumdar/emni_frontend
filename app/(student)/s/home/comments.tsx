"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Heart, MessageSquare, Send, Trash2, Edit3, ChevronDown, ChevronUp, Reply, X, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";

interface User {
  user_id: string;
  name: string;
  username: string;
  user_type: "Student" | "Mentor" | "Admin";
  image_link?: string;
}

interface Comment {
  comment_id: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  username: string;
  user_type: "Student" | "Mentor" | "Admin";
  reaction_count: number;
  has_reacted: boolean;
  replies_count: number;
  replies?: Comment[];
}

interface CommentsProps {
  postId: string;
  commentCount: number;
  currentUser: User | null;
  onReactionToggle: (post_id: string, has_reacted: boolean) => void;
  isReacting: string | null;
  hasReacted: boolean;
  reactionCount: number;
}

// Custom Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 w-96 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete Comment</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600/30"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500/90 hover:bg-red-500 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid date";
  }
};

// Helper function to get avatar dot color based on user_type
const getAvatarDotColor = (userType: string): string => {
  switch (userType) {
    case "Mentor":
      return "bg-orange-500";
    case "Student":
      return "bg-gray-500";
    case "Admin":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

const Comments = ({
  postId,
  commentCount,
  currentUser,
  onReactionToggle,
  isReacting,
  hasReacted,
  reactionCount,
}: CommentsProps) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(commentCount);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<{
    comment_id: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; commentId: string | null }>({
    isOpen: false,
    commentId: null,
  });

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const req: ApiRequestType = {
        endpoint: `api/news-feed/post/comments/${postId}`,
        method: "GET",
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        const normalizedComments = (res.data.comments || []).map((comment: any) => ({
          comment_id: comment.comment_id || "",
          user_id: comment.user_id || "",
          post_id: comment.post_id || postId,
          parent_comment_id: comment.parent_comment_id || null,
          content: comment.content || "",
          created_at: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
          username: comment.username || "anonymous",
          user_type: comment.user_type || "Student",
          reaction_count: Number(comment.reaction_count) || 0,
          has_reacted: Boolean(comment.has_reacted),
          replies_count: Number(comment.replies_count) || 0,
          replies: comment.replies || [],
        }));
        setComments(normalizedComments);
        setTotalComments(Number(res.data.total_comments) || normalizedComments.length);
      } else {
        throw new Error(res.message || "Failed to fetch comments");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Fetch comments error:", error);
      setError(error.message || "Error fetching comments");
      toast.error("Failed to load comments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const req: ApiRequestType = {
        endpoint: `api/news-feed/comment/replies/${commentId}`,
        method: "GET",
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        const normalizedReplies = (res.data || []).map((reply: any) => ({
          comment_id: reply.comment_id || "",
          user_id: reply.user_id || "",
          post_id: reply.post_id || postId,
          parent_comment_id: reply.parent_comment_id || commentId,
          content: reply.content || "",
          created_at: reply.created_at ? new Date(reply.created_at).toISOString() : new Date().toISOString(),
          username: reply.username || "anonymous",
          user_type: reply.user_type || "Student",
          reaction_count: Number(reply.reaction_count) || 0,
          has_reacted: Boolean(reply.has_reacted),
          replies_count: Number(reply.replies_count) || 0,
          replies: reply.replies || [],
        }));
        return normalizedReplies;
      } else {
        throw new Error(res.message || "Failed to fetch replies");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Fetch replies error:", error);
      toast.error("Failed to load replies. Please try again.");
      return [];
    }
  };

  const toggleCommentExpansion = async (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    if (!expandedComments[commentId]) {
      const updateReplies = async (comments: Comment[], targetId: string): Promise<Comment[]> => {
        return await Promise.all(
          comments.map(async (comment) => {
            if (comment.comment_id === targetId && (!comment.replies || comment.replies.length === 0)) {
              const replies = await fetchReplies(targetId);
              return { ...comment, replies };
            }
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: await updateReplies(comment.replies, targetId) };
            }
            return comment;
          })
        );
      };

      setComments(await updateReplies(comments, commentId));
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        content: newComment,
        parent_comment_id: replyingTo || null,
      };
      const req: ApiRequestType = {
        endpoint: `api/news-feed/comment/${postId}`,
        method: "POST",
        body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
        setReplyingTo(null);
        await fetchComments();
      } else {
        throw new Error(res.message || "Failed to post comment");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Post comment error:", error);
      toast.error(error.message || "Error posting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = { content: replyContent };
      const req: ApiRequestType = {
        endpoint: `api/news-feed/reply/${parentCommentId}`,
        method: "POST",
        body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success && res.comment_id) {
        toast.success("Reply posted successfully");
        setReplyContent("");
        setReplyingTo(null);

        setComments(prev => {
          const updateCommentWithReply = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.comment_id === parentCommentId) {
                const newReply: Comment = {
                  comment_id: res.comment_id,
                  user_id: currentUser?.user_id || "",
                  post_id: comment.post_id,
                  parent_comment_id: parentCommentId,
                  content: replyContent,
                  created_at: new Date().toISOString(),
                  username: currentUser?.username || "You",
                  user_type: currentUser?.user_type || "Student",
                  reaction_count: 0,
                  has_reacted: false,
                  replies_count: 0,
                  replies: [],
                };
                return {
                  ...comment,
                  replies_count: comment.replies_count + 1,
                  replies: [...(comment.replies || []), newReply],
                };
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateCommentWithReply(comment.replies),
                };
              }
              return comment;
            });
          };

          return updateCommentWithReply(prev);
        });

        setExpandedComments(prev => ({
          ...prev,
          [parentCommentId]: true,
        }));
        setTotalComments(prev => prev + 1);
      } else {
        throw new Error(`Failed to post reply: Invalid response data - ${JSON.stringify(res)}`);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Post reply error:", error);
      toast.error(error.message || "Error posting reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async () => {
    if (!editingComment || !editingComment.content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = { content: editingComment.content };
      const req: ApiRequestType = {
        endpoint: `api/news-feed/comment/${editingComment.comment_id}`,
        method: "PUT",
        body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Comment updated successfully");
        setComments(prev => {
          const updateCommentContent = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.comment_id === editingComment.comment_id) {
                return { ...comment, content: editingComment.content, created_at: new Date().toISOString() };
              }
              if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: updateCommentContent(comment.replies) };
              }
              return comment;
            });
          };
          return updateCommentContent(prev);
        });
        setEditingComment(null);
      } else {
        throw new Error(res.message || "Failed to update comment");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Update comment error:", error);
      toast.error(error.message || "Error updating comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeleteModal({ isOpen: true, commentId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.commentId) return;

    setIsSubmitting(true);
    try {
      const req: ApiRequestType = {
        endpoint: `api/news-feed/comment/${deleteModal.commentId}`,
        method: "DELETE",
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Comment deleted successfully");
        setComments(prev => {
          const updateCommentList = (comments: Comment[]): { updated: Comment[], deletedCount: number } => {
            let deletedCount = 0;
            const updatedComments = comments.filter(comment => {
              if (comment.comment_id === deleteModal.commentId) {
                deletedCount = 1 + (comment.replies_count || 0);
                return false;
              }
              if (comment.replies && comment.replies.length > 0) {
                const result = updateCommentList(comment.replies);
                comment.replies = result.updated;
                comment.replies_count = Math.max(0, comment.replies_count - result.deletedCount);
                deletedCount += result.deletedCount;
              }
              return true;
            });
            return { updated: updatedComments, deletedCount };
          };

          const { updated, deletedCount } = updateCommentList(prev);
          setTotalComments(prev => Math.max(0, prev - deletedCount));
          return updated;
        });
        setDeleteModal({ isOpen: false, commentId: null });
      } else {
        throw new Error(res.message || "Failed to delete comment");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Delete comment error:", error);
      toast.error(error.message || "Error deleting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCommentReaction = async (commentId: string, hasReacted: boolean) => {
    try {
      const endpoint = hasReacted ? "api/news-feed/reaction/remove" : "api/news-feed/reaction/add";
      const method = hasReacted ? "DELETE" : "POST";
      const body = { comment_id: commentId };
      const req: ApiRequestType = { endpoint, method, body, auth: true };
      const res = await apiRequest(req);

      if (res.success) {
        setComments(prev => {
          const updateReactions = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.comment_id === commentId) {
                return {
                  ...comment,
                  reaction_count: hasReacted ? comment.reaction_count - 1 : comment.reaction_count + 1,
                  has_reacted: !hasReacted,
                };
              }
              if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: updateReactions(comment.replies) };
              }
              return comment;
            });
          };
          return updateReactions(prev);
        });
      } else {
        throw new Error(res.message || `Failed to ${hasReacted ? "remove" : "add"} reaction`);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Toggle comment reaction error:", error);
      toast.error(error.message || `Error ${hasReacted ? "removing" : "adding"} reaction`);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  const canEditComment = (comment: Comment): boolean => {
    if (!currentUser) return false;
    return currentUser.user_id === comment.user_id || 
           currentUser.username === comment.username;
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isCurrentUserComment = canEditComment(comment);
    const hasReplies = comment.replies_count > 0;

    return (
      <motion.div 
        key={comment.comment_id} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`space-y-3 ${depth > 0 ? `ml-${depth * 8}` : ""}`}
      >
        <div className="group">
          <div className="flex items-start space-x-3">
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <img
                  src={`https://robohash.org/${comment.username}.png?size=200x200`}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full border-2 border-orange-500/30 shadow-lg"
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900",
                  getAvatarDotColor(comment.user_type)
                )}></div>
              </div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.div 
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 relative shadow-lg"
                whileHover={{ borderColor: "rgba(249, 115, 22, 0.5)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-white text-sm">
                      {comment.username}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium px-2 py-1",
                        comment.user_type === "Mentor"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : comment.user_type === "Student"
                          ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      )}
                    >
                      {comment.user_type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  {isCurrentUserComment && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-orange-400 p-2 rounded-lg hover:bg-gray-800/50"
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
                          onClick={() =>
                            setEditingComment({
                              comment_id: comment.comment_id,
                              content: comment.content,
                            })
                          }
                        >
                          <Edit3 className="w-4 h-4 text-orange-400" />
                          <span className="text-white">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center space-x-3 text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg px-3 py-2 m-1"
                          onClick={() => handleDeleteComment(comment.comment_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {editingComment?.comment_id === comment.comment_id ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <textarea
                      value={editingComment.content}
                      onChange={(e) =>
                        setEditingComment({
                          ...editingComment,
                          content: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all resize-none"
                      rows={3}
                      placeholder="Edit your comment..."
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingComment(null)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg px-4"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditComment}
                        disabled={isSubmitting}
                        size="sm"
                        className="bg-orange-500/90 hover:bg-orange-500 text-white rounded-lg px-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {isSubmitting ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-gray-200 text-sm leading-relaxed mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleCommentReaction(comment.comment_id, comment.has_reacted)}
                        className={cn(
                          "flex items-center space-x-2 text-sm transition-all duration-200 px-2 py-1 rounded-lg",
                          comment.has_reacted
                            ? "text-red-400 bg-red-500/10"
                            : "text-gray-400 hover:text-red-400 hover:bg-red-500/5"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", comment.has_reacted && "fill-current")} />
                        <span className="font-medium">{comment.reaction_count}</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setReplyingTo(comment.comment_id);
                          setExpandedComments(prev => ({
                            ...prev,
                            [comment.comment_id]: true,
                          }));
                        }}
                        className="flex items-center space-x-2 text-sm text-gray-400 hover:text-orange-400 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-orange-500/5"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
              
              <AnimatePresence>
                {replyingTo === comment.comment_id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 ml-4 flex items-start space-x-3"
                  >
                    <motion.div 
                      className="flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="relative">
                        <img
                          src={currentUser?.image_link || `https://robohash.org/${currentUser?.username || 'user'}.png?size=200x200`}
                          alt={currentUser?.username || "User"}
                          className="w-8 h-8 rounded-full border-2 border-orange-500/30 shadow-lg"
                        />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900",
                          getAvatarDotColor(currentUser?.user_type || "Student")
                        )}></div>
                      </div>
                    </motion.div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        placeholder={`Replying to ${comment.username}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg px-4"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleCreateReply(comment.comment_id)}
                          disabled={isSubmitting || !replyContent.trim()}
                          size="sm"
                          className="bg-orange-500/90 hover:bg-orange-500 text-white rounded-lg px-4"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          {isSubmitting ? "Posting..." : "Reply"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {hasReplies && (
            <div className="ml-10 pl-3 border-l-2 border-gray-700/30">
              <motion.button
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCommentExpansion(comment.comment_id)}
                className="flex items-center text-sm text-orange-400 hover:text-orange-300 mb-3 transition-colors duration-200"
              >
                {expandedComments[comment.comment_id] ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-1" />
                    Hide {comment.replies_count} replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-1" />
                    Show {comment.replies_count} replies
                  </>
                )}
              </motion.button>
              <AnimatePresence>
                {expandedComments[comment.comment_id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    {(comment.replies || []).map((reply) => renderComment(reply, depth + 1))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReactionToggle(postId, hasReacted)}
            disabled={!!isReacting}
            className={cn(
              "flex items-center space-x-2 text-sm transition-all duration-200 px-2 py-1 rounded-lg",
              hasReacted
                ? "text-red-400 bg-red-500/10"
                : "text-gray-400 hover:text-red-400 hover:bg-red-500/5"
            )}
          >
            <Heart className={cn("w-5 h-5", hasReacted && "fill-current")} />
            <span className="font-medium">{reactionCount}</span>
          </motion.button>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <MessageSquare className="w-5 h-5" />
            <span>{totalComments} comments</span>
          </div>
        </div>
        {comments.length > 2 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleShowAllComments}
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
          >
            {showAllComments ? "Show less" : `Show all ${totalComments} comments`}
          </motion.button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start space-x-3"
      >
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative">
            <img
              src={currentUser?.image_link || `https://robohash.org/${currentUser?.username || 'user'}.png?size=200x200`}
              alt={currentUser?.username || "User"}
              className="w-10 h-10 rounded-full border-2 border-orange-500/30 shadow-lg"
            />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900",
              getAvatarDotColor(currentUser?.user_type || "Student")
            )}></div>
          </div>
        </motion.div>
        <div className="flex-1 space-y-3">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all resize-none"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            {replyingTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg px-4"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button
              onClick={handleCreateComment}
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
              className="bg-orange-500/90 hover:bg-orange-500 text-white rounded-lg px-4"
            >
              <Send className="w-4 h-4 mr-1" />
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </motion.div>

      {isLoading && comments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-gray-400">Loading comments...</p>
        </motion.div>
      ) : error && comments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-orange-400">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchComments}
            className="mt-3 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg px-4"
          >
            Retry
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {displayedComments.map((comment) => renderComment(comment))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, commentId: null })}
        onConfirm={confirmDelete}
        isDeleting={isSubmitting}
      />
    </motion.div>
  );
};

export default Comments;
