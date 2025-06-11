"use client";

import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Vote, Send, Check, Trash2, Edit3, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
import { cn } from "@/lib/utils";
import { isBefore, differenceInSeconds } from "date-fns";
import Comments from "./comments";
import { Switch } from "@/components/ui/switch";
import { jakarta } from "@/app/utils/font";

export type MentorInfoType = {
  name: string;
  email: string;
  username: string;
  gender: "Male" | "Female" | null;
  grad_year: number;
  bio: string;
  socials: {
    github: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  };
  dob: Date | null;
  password?: string;
  image_link: string;
  user_type: "Mentor";
};

export function getAvatar(username: string): string {
  return `https://robohash.org/${username}.png?size=200x200`;
}

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth();
    const utcDate = date.getUTCDate();
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const localTime = new Date(utcYear, utcMonth, utcDate, utcHours, utcMinutes);
    return localTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Date";
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 25, mass: 1 },
  },
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting, itemType }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  itemType: "Post" | "Poll";
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
          <div className="bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 w-96 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete {itemType}</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
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

interface Post {
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  user_type: "Mentor" | "Admin" | "Student";
  hashtags: string[];
  reaction_count: number;
  has_reacted: boolean;
  comment_count: number;
}

interface PollOption {
  option_id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  has_voted: boolean;
}

interface Poll {
  poll_id: string;
  user_id: string;
  question: string;
  end_time: string | null;
  created_at: string;
  username: string;
  user_type: "Mentor" | "Admin" | "Student";
  hashtags: string[];
  options: PollOption[];
  has_voted: boolean;
  total_votes: number;
}

interface User {
  user_id: string;
  name: string;
  username: string;
  user_type: "Mentor" | "Admin" | "Student";
  email?: string;
  bio?: string;
  graduation_year?: string;
  dob?: Date | null;
  gender?: string;
  image_link?: string;
}

export async function getMyProfileDetailsMentor() {
  const req: ApiRequestType = {
    endpoint: `api/mentor/myself`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success || !res.data) {
    throw new Error("Error fetching mentor details");
  }

  const refined: MentorInfoType = {
    ...res.data,
    dob: res.data.dob ? new Date(res.data.dob) : null,
    image_link:
      res.data.image_link && res.data.image_link.length > 0
        ? res.data.image_link
        : getAvatar(res.data.username),
    user_type: "Mentor",
  };
  return refined;
}

const MentorNewsFeed: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostHashtags, setNewPostHashtags] = useState("");
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState<string[]>(["", ""]);
  const [newPollEndTime, setNewPollEndTime] = useState<Date | null>(null);
  const [newPollHashtags, setNewPollHashtags] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReacting, setIsReacting] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<{
    post_id: string;
    content: string;
    hashtags: string;
  } | null>(null);
  const [editingPoll, setEditingPoll] = useState<{
    poll_id: string;
    question: string;
    options: string[];
    end_time: string | null;
    hashtags: string;
  } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "my-posts">("all");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<{ [poll_id: string]: string }>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemType: "Post" | "Poll" | null;
  }>({
    isOpen: false,
    itemId: null,
    itemType: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const getCurrentUserId = () => {
    if (typeof window === "undefined") return null;
    const mentorId = localStorage.getItem("mentor-id");
    if (mentorId) {
      return { id: mentorId, type: "mentor" as const };
    }
    return null;
  };

  const validatePollEndTime = (time: Date | null) => {
    if (!time) {
      setTimeError("Please select an end time");
      return false;
    }
    const now = new Date();
    if (!isBefore(now, time)) {
      setTimeError("End time must be in the future");
      return false;
    }
    setTimeError(null);
    return true;
  };

  const updateCountdowns = useCallback(() => {
    setCountdowns(prev => {
      const newCountdowns = { ...prev };
      polls.forEach(poll => {
        if (poll.end_time) {
          const end = new Date(poll.end_time);
          const now = new Date();
          if (end > now) {
            const diff = differenceInSeconds(end, now);
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            newCountdowns[poll.poll_id] = `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          } else {
            newCountdowns[poll.poll_id] = "Poll ended";
          }
        } else {
          newCountdowns[poll.poll_id] = "No end time";
        }
      });
      return newCountdowns;
    });
  }, [polls]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateCountdowns]);

  const fetchCurrentUser = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const user = getCurrentUserId();
      if (!user?.id || user.type !== "mentor") {
        throw new Error("Please sign in as a mentor to access the news feed");
      }

      const profileDetails = await getMyProfileDetailsMentor();
      setCurrentUser({
        user_id: user.id,
        name: profileDetails.name,
        username: profileDetails.username,
        user_type: "Mentor",
        email: profileDetails.email,
        bio: profileDetails.bio,
        graduation_year: profileDetails.grad_year?.toString(),
        dob: profileDetails.dob,
        gender: profileDetails.gender ?? undefined,
        image_link: profileDetails.image_link,
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
      toast.error("Authentication required. Please sign in.");
      router.push("/sign-in");
    } finally {
      setIsUserLoading(false);
    }
  }, [router]);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUserId();
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const postEndpoint =
        selectedFilter === "my-posts"
          ? `api/news-feed/posts/${user.id}`
          : "api/news-feed/posts";
      const postReq: ApiRequestType = {
        endpoint: postEndpoint,
        method: "GET",
        auth: true,
      };
      const postRes = await apiRequest(postReq);
      if (postRes.success) {
        const postsData = Array.isArray(postRes.data) ? postRes.data : [];
        const normalizedPosts = postsData.map((post: any) => ({
          post_id: post.post_id || "",
          user_id: post.user_id || "",
          content: post.content || "",
          created_at: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
          username: post.username || "anonymous",
          user_type: post.user_type || "Mentor",
          hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
          reaction_count: Number(post.reaction_count) || 0,
          has_reacted: Boolean(post.has_reacted),
          comment_count: Number(post.comment_count) || 0,
        }));
        setPosts(normalizedPosts);
      } else {
        throw new Error(postRes.message || "Failed to fetch posts");
      }

      const pollEndpoint =
        selectedFilter === "my-posts"
          ? `api/news-feed/polls/${user.id}`
          : "api/news-feed/polls";
      const pollReq: ApiRequestType = {
        endpoint: pollEndpoint,
        method: "GET",
        auth: true,
      };
      const pollRes = await apiRequest(pollReq);
      if (pollRes.success) {
        const pollsData = Array.isArray(pollRes.data) ? pollRes.data : [];
        const normalizedPolls = pollsData.map((poll: any) => ({
          poll_id: poll.poll_id || "",
          user_id: poll.user_id || "",
          question: poll.question || "",
          end_time: poll.end_time ? poll.end_time : null,
          created_at: poll.created_at ? new Date(poll.created_at).toISOString() : new Date().toISOString(),
          username: poll.username || "anonymous",
          user_type: poll.user_type || "Mentor",
          hashtags: Array.isArray(poll.hashtags) ? poll.hashtags : [],
          options: Array.isArray(poll.options)
            ? poll.options.map((opt: any) => ({
                option_id: opt.option_id || "",
                poll_id: poll.poll_id || "",
                option_text: opt.option_text || "",
                vote_count: Number(opt.vote_count) || 0,
                has_voted: Boolean(opt.has_voted),
              }))
            : [],
          has_voted: Boolean(poll.has_voted),
          total_votes: Number(poll.total_votes) || 0,
        }));
        setPolls(normalizedPolls);
      } else {
        throw new Error(pollRes.message || "Failed to fetch polls");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Fetch content error:", error);
      setError(error.message || "Error fetching content");
      toast.error("Failed to load content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    const user = getCurrentUserId();
    if (user?.id) {
      fetchCurrentUser();
    } else {
      router.push("/sign-in");
    }
  }, [fetchCurrentUser, router]);

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      fetchContent();
    }
  }, [isUserLoading, currentUser, fetchContent, selectedFilter]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Content is required for a post");
      return;
    }

    setIsSubmitting(true);
    try {
      const hashtagsArray = newPostHashtags
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h);
      const body = {
        content: newPostContent,
        hashtags: hashtagsArray,
      };
      const req: ApiRequestType = {
        endpoint: "api/news-feed/post",
        method: "POST",
        body: body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Post created successfully");
        setNewPostContent("");
        setNewPostHashtags("");
        const tempPostId = res.data?.post_id || `temp-${Date.now()}`;
        setPosts(prevPosts => [
          {
            post_id: tempPostId,
            user_id: currentUser?.user_id || "",
            content: newPostContent,
            created_at: new Date().toISOString(),
            username: currentUser?.username || "You",
            user_type: currentUser?.user_type || "Mentor",
            hashtags: hashtagsArray,
            reaction_count: 0,
            has_reacted: false,
            comment_count: 0,
          },
          ...prevPosts,
        ]);
        setSelectedFilter("my-posts");
        await fetchContent();
      } else {
        throw new Error(res.message || "Failed to create post");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Failed to create post:", error.message);
      toast.error(error.message || "Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPollQuestion.trim()) {
      toast.error("Question is required for a poll");
      return;
    }
    const validOptions = newPollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error("At least two non-empty options are required");
      return;
    }
    if (!validatePollEndTime(newPollEndTime)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const hashtagsArray = newPollHashtags
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h);
      const body = {
        question: newPollQuestion,
        options: validOptions,
        end_time: newPollEndTime?.toISOString() || null,
        hashtags: hashtagsArray,
      };
      const req: ApiRequestType = {
        endpoint: "api/news-feed/poll",
        method: "POST",
        body: body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Poll created successfully");
        setNewPollQuestion("");
        setNewPollOptions(["", ""]);
        setNewPollEndTime(null);
        setNewPollHashtags("");
        const tempPollId = res.data?.poll_id || `temp-poll-${Date.now()}`;
        setPolls(prevPolls => [
          {
            poll_id: tempPollId,
            user_id: currentUser?.user_id || "",
            question: newPollQuestion,
            end_time: newPollEndTime?.toISOString() || null,
            created_at: new Date().toISOString(),
            username: currentUser?.username || "You",
            user_type: currentUser?.user_type || "Mentor",
            hashtags: hashtagsArray,
            options: validOptions.map(opt => ({
              option_id: `temp-opt-${Date.now()}-${Math.random()}`,
              poll_id: tempPollId,
              option_text: opt,
              vote_count: 0,
              has_voted: false,
            })),
            has_voted: false,
            total_votes: 0,
          },
          ...prevPolls,
        ]);
        setSelectedFilter("my-posts");
        await fetchContent();
      } else {
        throw new Error(res.message || "Failed to create poll");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Failed to create poll:", error.message);
      toast.error(error.message || "Error creating poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (
    post_id: string,
    content: string,
    hashtags: string
  ) => {
    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      const hashtagsArray = hashtags
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h);
      const body = {
        content,
        hashtags: hashtagsArray,
      };
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.post_id === post_id
            ? { ...post, content, hashtags: hashtagsArray }
            : post
        )
      );
      const req: ApiRequestType = {
        endpoint: `api/news-feed/post/${post_id}`,
        method: "PUT",
        body: body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Post updated successfully");
        setEditingPost(null);
      } else {
        setPosts(prevPosts => [...prevPosts]);
        throw new Error(res.message || "Failed to update post");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Failed to edit post:", error.message);
      toast.error(error.message || "Error updating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPoll = async (
    poll_id: string,
    question: string,
    options: string[],
    end_time: string | null,
    hashtags: string
  ) => {
    if (!question.trim()) {
      toast.error("Poll question cannot be empty");
      return;
    }
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error("At least two non-empty options are required");
      return;
    }
    if (end_time && !isBefore(new Date(), new Date(end_time))) {
      toast.error("Poll end time must be in the future");
      return;
    }
    setIsSubmitting(true);
    try {
      const hashtagsArray = hashtags
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h);
      const body = {
        question,
        options: validOptions,
        end_time: end_time || null,
        hashtags: hashtagsArray,
      };
      setPolls(prevPolls =>
        prevPolls.map(poll =>
          poll.poll_id === poll_id
            ? {
                ...poll,
                question,
                options: validOptions.map(opt => ({
                  option_id: `temp-opt-${Date.now()}-${Math.random()}`,
                  poll_id: poll_id,
                  option_text: opt,
                  vote_count: 0,
                  has_voted: false,
                })),
                end_time,
                hashtags: hashtagsArray,
              }
            : poll
        )
      );
      const req: ApiRequestType = {
        endpoint: `api/news-feed/poll/${poll_id}`,
        method: "PUT",
        body: body,
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        toast.success("Poll updated successfully");
        setEditingPoll(null);
      } else {
        setPolls(prevPolls => [...prevPolls]);
        throw new Error(res.message || "Failed to update poll");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Failed to edit poll:", error.message);
      toast.error(error.message || "Error updating poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (post_id: string) => {
    try {
      setPosts(prevPosts => prevPosts.filter(post => post.post_id !== post_id));
      const req: ApiRequestType = {
        endpoint: `api/news-feed/post/${post_id}`,
        method: "DELETE",
        auth: true,
      };
      const res = await apiRequest(req);
      if (!res.success) {
        setPosts(prevPosts => [...prevPosts]);
        throw new Error(res.message || "Failed to delete post");
      }
      toast.success("Post deleted successfully");
    } catch (err) {
      const error = err as Error;
      console.error("Failed to delete post:", error.message);
      toast.error(error.message || "Error deleting post");
    } finally {
      setDeleteModal({ isOpen: false, itemId: null, itemType: null });
      setIsSubmitting(false);
    }
  };

  const handleDeletePoll = async (poll_id: string) => {
    try {
      setPolls(prevPolls => prevPolls.filter(poll => poll.poll_id !== poll_id));
      const req: ApiRequestType = {
        endpoint: `api/news-feed/poll/${poll_id}`,
        method: "DELETE",
        auth: true,
      };
      const res = await apiRequest(req);
      if (!res.success) {
        setPolls(prevPolls => [...prevPolls]);
        throw new Error(res.message || "Failed to delete poll");
      }
      toast.success("Poll deleted successfully");
    } catch (err) {
      const error = err as Error;
      console.error("Failed to delete poll:", error.message);
      toast.error(error.message || "Error deleting poll");
    } finally {
      setDeleteModal({ isOpen: false, itemId: null, itemType: null });
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (itemId: string, itemType: "Post" | "Poll") => {
    setDeleteModal({ isOpen: true, itemId, itemType });
  };

  const confirmDelete = async () => {
    if (!deleteModal.itemId || !deleteModal.itemType) return;
    setIsSubmitting(true);
    if (deleteModal.itemType === "Post") {
      await handleDeletePost(deleteModal.itemId);
    } else {
      await handleDeletePoll(deleteModal.itemId);
    }
  };

  const handleVotePoll = async (poll_id: string, option_id: string, isUpdate: boolean) => {
    if (isVoting) return;
    setIsVoting(poll_id);
    
    try {
      setPolls(prevPolls =>
        prevPolls.map(poll => {
          if (poll.poll_id !== poll_id) return poll;
          
          const updatedOptions = poll.options.map(opt => ({
            ...opt,
            has_voted: opt.option_id === option_id ? !opt.has_voted : false,
            vote_count: opt.option_id === option_id 
              ? (isUpdate ? opt.vote_count : opt.vote_count + 1)
              : (isUpdate && opt.has_voted ? opt.vote_count - 1 : opt.vote_count),
          }));
          
          return {
            ...poll,
            options: updatedOptions,
            has_voted: true,
            total_votes: isUpdate 
              ? poll.total_votes 
              : poll.total_votes + 1,
          };
        })
      );

      const body = { poll_id, option_id };
      const endpoint = isUpdate ? "api/news-feed/poll/vote/update" : "api/news-feed/poll/vote/add";
      const method = isUpdate ? "PUT" : "POST";
      const req: ApiRequestType = {
        endpoint,
        method,
        body,
        auth: true,
      };
      
      const res = await apiRequest(req);
      if (res.success) {
        toast.success(isUpdate ? "Vote updated successfully" : "Voted successfully");
        await fetchContent();
      } else {
        setPolls(prevPolls => [...prevPolls]);
        if (res.status === 400 && res.message.includes("already voted")) {
          toast.warning("You have already voted for this option");
        } else {
          throw new Error(res.message || `Failed to ${isUpdate ? "update" : "cast"} vote`);
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to ${isUpdate ? "update" : "cast"} vote:`, error.message);
      if (!error.message.includes("already voted")) {
        toast.error(error.message || `Error ${isUpdate ? "updating" : "casting"} vote`);
      }
    } finally {
      setIsVoting(null);
    }
  };

  const handleToggleReaction = async (post_id: string, has_reacted: boolean) => {
    if (isReacting) return;
    setIsReacting(post_id);

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.post_id === post_id
          ? {
              ...post,
              reaction_count: has_reacted
                ? post.reaction_count - 1
                : post.reaction_count + 1,
              has_reacted: !has_reacted,
            }
          : post
      )
    );

    try {
      const endpoint = has_reacted
        ? "api/news-feed/reaction/remove"
        : "api/news-feed/reaction/add";
      const method = has_reacted ? "DELETE" : "POST";
      const body = { post_id };

      const req: ApiRequestType = {
        endpoint,
        method,
        body,
        auth: true,
      };

      const res = await apiRequest(req);

      if (!res.success) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.post_id === post_id
              ? {
                  ...post,
                  reaction_count: has_reacted
                    ? post.reaction_count + 1
                    : post.reaction_count - 1,
                  has_reacted: has_reacted,
                }
              : post
          )
        );

        if (res.status === 400 && res.message?.includes("already reacted")) {
          await fetchContent();
          toast.error("You have already reacted to this post");
        } else {
          throw new Error(res.message || `Failed to ${has_reacted ? "remove" : "add"} reaction`);
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to ${has_reacted ? "remove" : "add"} reaction:`, error.message);
      toast.error(error.message || `Error ${has_reacted ? "removing" : "adding"} reaction`);
    } finally {
      setIsReacting(null);
    }
  };

  const getPollTimeRemaining = (poll_id: string) => {
    return countdowns[poll_id] || "No end time";
  };

  const addPollOption = () => {
    setNewPollOptions(prev => [...prev, ""]);
  };

  const updatePollOption = (index: number, value: string) => {
    setNewPollOptions(prev => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  };

  const removePollOption = (index: number) => {
    setNewPollOptions(prev => prev.filter((_, i) => i !== index));
  };

  const calculateVotePercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return "0%";
    return `${Math.round((voteCount / totalVotes) * 100)}%`;
  };

  const filteredContent = [...posts, ...polls].filter((item) => {
    if (!searchTerm.trim()) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    if ("post_id" in item) {
      return (
        item.content.toLowerCase().includes(lowerSearchTerm) ||
        item.hashtags.some((hashtag) => hashtag.toLowerCase().includes(lowerSearchTerm))
      );
    } else {
      return (
        item.question.toLowerCase().includes(lowerSearchTerm) ||
        item.hashtags.some((hashtag) => hashtag.toLowerCase().includes(lowerSearchTerm)) ||
        item.options.some((option) => option.option_text.toLowerCase().includes(lowerSearchTerm))
      );
    }
  }).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (isUserLoading) {
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
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
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
            <h3 className="text-white font-semibold mb-2">Loading Profile</h3>
            <p className="text-slate-400 text-sm">Fetching your profile...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-md"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Error Loading Newsfeed</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setError(null);
              fetchContent();
            }}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ScrollArea className="h-screen">
        <div className="max-w-3xl mx-auto p-6 space-y-8">
          {/* Header Section with Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"
              >
                <Send className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${jakarta.className} text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent`}
                >
                  Discussion Forum
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-sm"
                >
                  Share and discover posts and polls
                </motion.p>
              </div>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative w-full max-w-md mx-auto"
            >
              <input
                type="text"
                placeholder="Search posts and polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                aria-label="Search content"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </motion.div>

            {/* Toggle Switch for Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center space-x-4 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-3"
            >
              <span className="text-sm font-semibold text-slate-300">All Content</span>
              <Switch
                checked={selectedFilter === "my-posts"}
                onCheckedChange={(checked: boolean) => setSelectedFilter(checked ? "my-posts" : "all")}
                className="data-[state=checked]:bg-violet-600"
                aria-label="Toggle between all content and my content"
              />
              <span className="text-sm font-semibold text-slate-300">My Content</span>
            </motion.div>
          </motion.div>

          {selectedFilter === "my-posts" && (
            <>
              {/* Create Post Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
              >
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={currentUser ? getAvatar(currentUser.username) : "/placeholder.png"}
                      alt={currentUser?.name || "User"}
                      className="w-10 h-10 rounded-xl border-2 border-slate-600/50"
                    />
                    <h3 className="text-white font-semibold text-lg">Create a Post</h3>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      placeholder="What's on your mind?"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                      rows={3}
                      aria-label="Post content"
                    />
                    <input
                      placeholder="Hashtags (comma-separated)"
                      value={newPostHashtags}
                      onChange={(e) => setNewPostHashtags(e.target.value)}
                      className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                      aria-label="Post hashtags"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreatePost}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Posting...
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 inline" />
                          Create Post
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Create Poll Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
              >
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={currentUser ? getAvatar(currentUser.username) : "/placeholder.png"}
                      alt={currentUser?.name || "User"}
                      className="w-10 h-10 rounded-xl border-2 border-slate-600/50"
                    />
                    <h3 className="text-white font-semibold text-lg">Create a Poll</h3>
                  </div>
                  <div className="space-y-3">
                    <input
                      placeholder="Poll question"
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                      className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                      aria-label="Poll question"
                    />
                    {newPollOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                          aria-label={`Poll option ${index + 1}`}
                        />
                        {newPollOptions.length > 2 && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => removePollOption(index)}
                            className="text-red-400 hover:text-red-500 p-2"
                            aria-label="Remove poll option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addPollOption}
                      className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Add Option
                    </motion.button>
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-slate-300">End Time</span>
                      <DateTimePicker
                        field={{
                          value: newPollEndTime || new Date(),
                          onChange: (val: Date) => {
                            setNewPollEndTime(val);
                            validatePollEndTime(val);
                          },
                        }}
                        classnames="bg-slate-700/20 text-white rounded-lg border border-slate-600/30 focus:ring-2 focus:ring-violet-500/50"
                      />
                      {timeError && (
                        <span className="text-red-400 text-sm">{timeError}</span>
                      )}
                    </div>
                    <input
                      placeholder="Hashtags (comma-separated)"
                      value={newPollHashtags}
                      onChange={(e) => setNewPollHashtags(e.target.value)}
                      className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                      aria-label="Poll hashtags"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreatePoll}
                      disabled={isSubmitting || !!timeError}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating...
                        </div>
                      ) : (
                        <>
                          <Vote className="w-4 h-4 mr-2 inline" />
                          Create Poll
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="w-16 h-16 border-4 border-slate-700 border-t-amber-500/80 rounded-full mx-auto"
                  />
                </div>
                <p className="text-white mt-4">Loading content...</p>
              </motion.div>
            ) : filteredContent.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <Send className="w-10 h-10 text-slate-400" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-3"
                >
                  {searchTerm.trim() ? "No results found" : selectedFilter === "all" ? "No content available" : "No content created"}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 mb-6"
                >
                  {searchTerm.trim()
                    ? "Try a different search term."
                    : selectedFilter === "all"
                    ? "Be the first to post or create a poll!"
                    : "Create your first post or poll!"}
                </motion.p>
                {selectedFilter === "my-posts" && !searchTerm.trim() && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFilter("all")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    View All Content
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {filteredContent.map((item) => (
                  "post_id" in item ? (
                    <motion.div
                      key={item.post_id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
                    >
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              src={getAvatar(item.username)}
                              alt={item.username}
                              className="w-10 h-10 rounded-xl border-2 border-slate-600/50"
                            />
                            <div>
                              <p className="text-white font-semibold">{item.username}</p>
                              <p className="text-slate-400 text-xs">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`${
                                item.user_type === "Mentor"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : item.user_type === "Student"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }`}
                            >
                              {item.user_type}
                            </Badge>
                            {(item.user_id === currentUser?.user_id || selectedFilter === "my-posts") && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40 bg-slate-800/95 border border-slate-700/50 text-white">
                                  <DropdownMenuItem
                                    className="flex items-center space-x-2 hover:bg-slate-700/50"
                                    onClick={() =>
                                      setEditingPost({
                                        post_id: item.post_id,
                                        content: item.content,
                                        hashtags: item.hashtags.join(", "),
                                      })
                                    }
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center space-x-2 text-red-400 hover:bg-slate-700/50"
                                    onClick={() => openDeleteModal(item.post_id, "Post")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        <div className="pb-3 border-b border-slate-700/30">
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.content}</p>
                        </div>
                        {item.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.hashtags.map((hashtag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                              >
                                #{hashtag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Comments
                          postId={item.post_id}
                          commentCount={item.comment_count}
                          currentUser={currentUser}
                          onReactionToggle={handleToggleReaction}
                          isReacting={isReacting}
                          hasReacted={item.has_reacted}
                          reactionCount={item.reaction_count}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={item.poll_id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
                    >
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              src={getAvatar(item.username)}
                              alt={item.username}
                              className="w-10 h-10 rounded-xl border-2 border-slate-600/50"
                            />
                            <div>
                              <p className="text-white font-semibold">{item.username}</p>
                              <p className="text-slate-400 text-xs">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`${
                                item.user_type === "Mentor"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : item.user_type === "Student"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }`}
                            >
                              {item.user_type}
                            </Badge>
                            {(item.user_id === currentUser?.user_id || selectedFilter === "my-posts") && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40 bg-slate-800/95 border border-slate-700/50 text-white">
                                  <DropdownMenuItem
                                    className="flex items-center space-x-2 hover:bg-slate-700/50"
                                    onClick={() =>
                                      setEditingPoll({
                                        poll_id: item.poll_id,
                                        question: item.question,
                                        options: item.options.map(opt => opt.option_text),
                                        end_time: item.end_time,
                                        hashtags: item.hashtags.join(", "),
                                      })
                                    }
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center space-x-2 text-red-400 hover:bg-slate-700/50"
                                    onClick={() => openDeleteModal(item.poll_id, "Poll")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        <div className="pb-3 border-b border-slate-700/30">
                          <p className="text-white font-semibold text-sm">{item.question}</p>
                          <p className="text-slate-400 text-xs">{getPollTimeRemaining(item.poll_id)}</p>
                        </div>
                        {item.options.map((option, index) => (
                          <motion.div
                            key={option.option_id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="mb-2"
                          >
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left justify-between transition-all duration-200 text-sm",
                                item.end_time && new Date(item.end_time) < new Date()
                                  ? "bg-slate-700/20 cursor-not-allowed text-slate-400"
                                  : option.has_voted
                                  ? "bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30"
                                  : item.has_voted
                                  ? "bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30"
                                  : "bg-slate-700/20 border-slate-600/30 text-slate-300 hover:bg-slate-700/30 hover:border-amber-500/30"
                              )}
                              onClick={() => {
                                if (option.has_voted) {
                                  toast.warning("You've already voted for this option");
                                } else if (!item.has_voted || (item.end_time && new Date(item.end_time) >= new Date())) {
                                  handleVotePoll(item.poll_id, option.option_id, item.has_voted);
                                }
                              }}
                              disabled={Boolean(
                                isVoting === item.poll_id || 
                                (item.end_time && new Date(item.end_time) < new Date())
                              )}
                            >
                              <span>{option.option_text}</span>
                              <span className="flex items-center text-xs">
                                {option.vote_count} votes ({calculateVotePercentage(option.vote_count, item.total_votes)})
                                {option.has_voted && (
                                  <Check className="w-4 h-4 ml-2 text-green-400" />
                                )}
                              </span>
                            </Button>
                          </motion.div>
                        ))}
                        {item.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.hashtags.map((hashtag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                              >
                                #{hashtag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-slate-400 text-xs">
                          Total votes: {item.total_votes}
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {editingPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                variants={cardVariants}
                className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-white font-semibold text-lg mb-4">Edit Post</h3>
                <div className="space-y-3">
                  <textarea
                    value={editingPost.content}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, content: e.target.value })
                    }
                    className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                    rows={3}
                    aria-label="Edit post content"
                  />
                  <input
                    value={editingPost.hashtags}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, hashtags: e.target.value })
                    }
                    placeholder="Hashtags (comma-separated)"
                    className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                    aria-label="Edit post hashtags"
                  />
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleEditPost(
                          editingPost.post_id,
                          editingPost.content,
                          editingPost.hashtags
                        )
                      }
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </div>
                      ) : (
                        "Save"
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {editingPoll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                variants={cardVariants}
                className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-white font-semibold text-lg mb-4">Edit Poll</h3>
                <div className="space-y-3">
                  <input
                    value={editingPoll.question}
                    onChange={(e) =>
                      setEditingPoll({ ...editingPoll, question: e.target.value })
                    }
                    className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                    aria-label="Edit poll question"
                  />
                  {editingPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        value={option}
                        onChange={(e) =>
                          setEditingPoll({
                            ...editingPoll,
                            options: editingPoll.options.map((opt, i) =>
                              i === index ? e.target.value : opt
                            ),
                          })
                        }
                        className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                        aria-label={`Edit poll option ${index + 1}`}
                      />
                      {editingPoll.options.length > 2 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setEditingPoll({
                              ...editingPoll,
                              options: editingPoll.options.filter((_, i) => i !== index),
                            })
                          }
                          className="text-red-400 hover:text-red-500 p-2"
                          aria-label="Remove poll option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setEditingPoll({
                        ...editingPoll,
                        options: [...editingPoll.options, ""],
                      })
                    }
                    className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Add Option
                  </motion.button>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-slate-300">End Time</span>
                    <DateTimePicker
                      field={{
                        value: editingPoll.end_time ? new Date(editingPoll.end_time) : new Date(),
                        onChange: (val: Date) => {
                          setEditingPoll({ ...editingPoll, end_time: val.toISOString() });
                          validatePollEndTime(val);
                        },
                      }}
                      classnames="bg-slate-700/20 text-white rounded-lg border border-slate-600/30 focus:ring-2 focus:ring-violet-500/50"
                    />
                    {timeError && (
                      <span className="text-red-400 text-sm">{timeError}</span>
                    )}
                  </div>
                  <input
                    value={editingPoll.hashtags}
                    onChange={(e) =>
                      setEditingPoll({ ...editingPoll, hashtags: e.target.value })
                    }
                    placeholder="Hashtags (comma-separated)"
                    className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                    aria-label="Edit poll hashtags"
                  />
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditingPoll(null)}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleEditPoll(
                          editingPoll.poll_id,
                          editingPoll.question,
                          editingPoll.options,
                          editingPoll.end_time,
                          editingPoll.hashtags
                        )
                      }
                      disabled={isSubmitting || !!timeError}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </div>
                      ) : (
                        "Save"
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          <DeleteConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemType: null })}
            onConfirm={confirmDelete}
            isDeleting={isSubmitting}
            itemType={deleteModal.itemType || "Post"}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MentorNewsFeed;


// "use client";

// import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "sonner";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { MoreVertical, Vote, Send, Check, Trash2, Edit3 } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
// import { cn } from "@/lib/utils";
// import { isBefore, differenceInSeconds } from "date-fns";
// import Comments from "./comments";
// import { Switch } from "@/components/ui/switch";
// import { jakarta } from "@/app/utils/font";

// export type MentorInfoType = {
//   name: string;
//   email: string;
//   username: string;
//   gender: "Male" | "Female" | null;
//   grad_year: number;
//   bio: string;
//   socials: {
//     github: string;
//     facebook: string;
//     linkedin: string;
//     twitter: string;
//   };
//   dob: Date | null;
//   password?: string;
//   image_link: string;
//   user_type: "Mentor";
// };

// export function getAvatar(username: string): string {
//   return `https://robohash.org/${username}.png?size=200x200`;
// }

// export const formatDate = (dateString: string) => {
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       return "Invalid Date";
//     }
//     const utcYear = date.getUTCFullYear();
//     const utcMonth = date.getUTCMonth();
//     const utcDate = date.getUTCDate();
//     const utcHours = date.getUTCHours();
//     const utcMinutes = date.getUTCMinutes();
//     const localTime = new Date(utcYear, utcMonth, utcDate, utcHours, utcMinutes);
//     return localTime.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   } catch {
//     return "Invalid Date";
//   }
// };

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05, delayChildren: 0.1 },
//   },
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 30, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { type: "spring", stiffness: 100, damping: 25, mass: 1 },
//   },
//   hover: {
//     y: -4,
//     scale: 1.01,
//     transition: { type: "spring", stiffness: 400, damping: 25 },
//   },
// };

// const shimmerVariants = {
//   animate: {
//     backgroundPosition: ["200% 0", "-200% 0"],
//     transition: {
//       duration: 2,
//       ease: "linear",
//       repeat: Infinity,
//     },
//   },
// };

// // --- New Delete Confirmation Modal ---
// const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting, itemType }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   isDeleting: boolean;
//   itemType: "Post" | "Poll";
// }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
//           onClick={onClose}
//         />
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9, y: 20 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.9, y: 20 }}
//           className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
//         >
//           <div className="bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 w-96 shadow-2xl">
//             <div className="text-center">
//               <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Trash2 className="w-6 h-6 text-red-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-white mb-2">Delete {itemType}</h3>
//               <p className="text-gray-300 mb-6">
//                 Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
//               </p>
//               <div className="flex gap-3">
//                 <Button
//                   onClick={onClose}
//                   variant="ghost"
//                   className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600/30"
//                   disabled={isDeleting}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={onConfirm}
//                   disabled={isDeleting}
//                   className="flex-1 bg-red-500/90 hover:bg-red-500 text-white"
//                 >
//                   {isDeleting ? "Deleting..." : "Delete"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </>
//     )}
//   </AnimatePresence>
// );

// interface Post {
//   post_id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   username: string;
//   user_type: "Mentor" | "Admin" | "Student";
//   hashtags: string[];
//   reaction_count: number;
//   has_reacted: boolean;
//   comment_count: number;
// }

// interface PollOption {
//   option_id: string;
//   poll_id: string;
//   option_text: string;
//   vote_count: number;
//   has_voted: boolean;
// }

// interface Poll {
//   poll_id: string;
//   user_id: string;
//   question: string;
//   end_time: string | null;
//   created_at: string;
//   username: string;
//   user_type: "Mentor" | "Admin" | "Student";
//   hashtags: string[];
//   options: PollOption[];
//   has_voted: boolean;
//   total_votes: number;
// }

// interface User {
//   user_id: string;
//   name: string;
//   username: string;
//   user_type: "Mentor" | "Admin" | "Student";
//   email?: string;
//   bio?: string;
//   graduation_year?: string;
//   dob?: Date | null;
//   gender?: string;
//   image_link?: string;
// }

// export async function getMyProfileDetailsMentor() {
//   const req: ApiRequestType = {
//     endpoint: `api/mentor/myself`,
//     method: "GET",
//     auth: true,
//   };

//   const res = await apiRequest(req);
//   if (!res.success || !res.data) {
//     throw new Error("Error fetching mentor details");
//   }

//   const refined: MentorInfoType = {
//     ...res.data,
//     dob: res.data.dob ? new Date(res.data.dob) : null,
//     image_link:
//       res.data.image_link && res.data.image_link.length > 0
//         ? res.data.image_link
//         : getAvatar(res.data.username),
//     user_type: "Mentor",
//   };
//   return refined;
// }

// const MentorNewsFeed: React.FC = () => {
//   const router = useRouter();
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [polls, setPolls] = useState<Poll[]>([]);
//   const [newPostContent, setNewPostContent] = useState("");
//   const [newPostHashtags, setNewPostHashtags] = useState("");
//   const [newPollQuestion, setNewPollQuestion] = useState("");
//   const [newPollOptions, setNewPollOptions] = useState<string[]>(["", ""]);
//   const [newPollEndTime, setNewPollEndTime] = useState<Date | null>(null);
//   const [newPollHashtags, setNewPollHashtags] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isReacting, setIsReacting] = useState<string | null>(null);
//   const [isVoting, setIsVoting] = useState<string | null>(null);
//   const [editingPost, setEditingPost] = useState<{
//     post_id: string;
//     content: string;
//     hashtags: string;
//   } | null>(null);
//   const [editingPoll, setEditingPoll] = useState<{
//     poll_id: string;
//     question: string;
//     options: string[];
//     end_time: string | null;
//     hashtags: string;
//   } | null>(null);
//   const [isUserLoading, setIsUserLoading] = useState(true);
//   const [selectedFilter, setSelectedFilter] = useState<"all" | "my-posts">("all");
//   const [timeError, setTimeError] = useState<string | null>(null);
//   const [countdowns, setCountdowns] = useState<{ [poll_id: string]: string }>({});
//   // New state for delete modal
//   const [deleteModal, setDeleteModal] = useState<{
//     isOpen: boolean;
//     itemId: string | null;
//     itemType: "Post" | "Poll" | null;
//   }>({
//     isOpen: false,
//     itemId: null,
//     itemType: null,
//   });

//   const getCurrentUserId = () => {
//     if (typeof window === "undefined") return null;
//     const mentorId = localStorage.getItem("mentor-id");
//     if (mentorId) {
//       return { id: mentorId, type: "mentor" as const };
//     }
//     return null;
//   };

//   const validatePollEndTime = (time: Date | null) => {
//     if (!time) {
//       setTimeError("Please select an end time");
//       return false;
//     }
//     const now = new Date();
//     if (!isBefore(now, time)) {
//       setTimeError("End time must be in the future");
//       return false;
//     }
//     setTimeError(null);
//     return true;
//   };

//   const updateCountdowns = useCallback(() => {
//     setCountdowns(prev => {
//       const newCountdowns = { ...prev };
//       polls.forEach(poll => {
//         if (poll.end_time) {
//           const end = new Date(poll.end_time);
//           const now = new Date();
//           if (end > now) {
//             const diff = differenceInSeconds(end, now);
//             const hours = Math.floor(diff / 3600);
//             const minutes = Math.floor((diff % 3600) / 60);
//             const seconds = diff % 60;
//             newCountdowns[poll.poll_id] = `${hours.toString().padStart(2, '0')}:${minutes
//               .toString()
//               .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//           } else {
//             newCountdowns[poll.poll_id] = "Poll ended";
//           }
//         } else {
//           newCountdowns[poll.poll_id] = "No end time";
//         }
//       });
//       return newCountdowns;
//     });
//   }, [polls]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       updateCountdowns();
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [updateCountdowns]);

//   const fetchCurrentUser = useCallback(async () => {
//     setIsUserLoading(true);
//     try {
//       const user = getCurrentUserId();
//       if (!user?.id || user.type !== "mentor") {
//         throw new Error("Please sign in as a mentor to access the news feed");
//       }

//       const profileDetails = await getMyProfileDetailsMentor();
//       setCurrentUser({
//         user_id: user.id,
//         name: profileDetails.name,
//         username: profileDetails.username,
//         user_type: "Mentor",
//         email: profileDetails.email,
//         bio: profileDetails.bio,
//         graduation_year: profileDetails.grad_year?.toString(),
//         dob: profileDetails.dob,
//         gender: profileDetails.gender ?? undefined,
//         image_link: profileDetails.image_link,
//       });
//     } catch (err) {
//       console.error("Failed to fetch user:", err);
//       toast.error("Authentication required. Please sign in.");
//       router.push("/sign-in");
//     } finally {
//       setIsUserLoading(false);
//     }
//   }, [router]);

//   const fetchContent = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const user = getCurrentUserId();
//       if (!user?.id) {
//         throw new Error("User not authenticated");
//       }

//       const postEndpoint =
//         selectedFilter === "my-posts"
//           ? `api/news-feed/posts/${user.id}`
//           : "api/news-feed/posts";
//       const postReq: ApiRequestType = {
//         endpoint: postEndpoint,
//         method: "GET",
//         auth: true,
//       };
//       const postRes = await apiRequest(postReq);
//       if (postRes.success) {
//         const postsData = Array.isArray(postRes.data) ? postRes.data : [];
//         const normalizedPosts = postsData.map((post: any) => ({
//           post_id: post.post_id || "",
//           user_id: post.user_id || "",
//           content: post.content || "",
//           created_at: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
//           username: post.username || "anonymous",
//           user_type: post.user_type || "Mentor",
//           hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
//           reaction_count: Number(post.reaction_count) || 0,
//           has_reacted: Boolean(post.has_reacted),
//           comment_count: Number(post.comment_count) || 0,
//         }));
//         setPosts(normalizedPosts);
//       } else {
//         throw new Error(postRes.message || "Failed to fetch posts");
//       }

//       const pollEndpoint =
//         selectedFilter === "my-posts"
//           ? `api/news-feed/polls/${user.id}`
//           : "api/news-feed/polls";
//       const pollReq: ApiRequestType = {
//         endpoint: pollEndpoint,
//         method: "GET",
//         auth: true,
//       };
//       const pollRes = await apiRequest(pollReq);
//       if (pollRes.success) {
//         const pollsData = Array.isArray(pollRes.data) ? pollRes.data : [];
//         const normalizedPolls = pollsData.map((poll: any) => ({
//           poll_id: poll.poll_id || "",
//           user_id: poll.user_id || "",
//           question: poll.question || "",
//           end_time: poll.end_time ? poll.end_time : null,
//           created_at: poll.created_at ? new Date(poll.created_at).toISOString() : new Date().toISOString(),
//           username: poll.username || "anonymous",
//           user_type: poll.user_type || "Mentor",
//           hashtags: Array.isArray(poll.hashtags) ? poll.hashtags : [],
//           options: Array.isArray(poll.options)
//             ? poll.options.map((opt: any) => ({
//                 option_id: opt.option_id || "",
//                 poll_id: poll.poll_id || "",
//                 option_text: opt.option_text || "",
//                 vote_count: Number(opt.vote_count) || 0,
//                 has_voted: Boolean(opt.has_voted),
//               }))
//             : [],
//           has_voted: Boolean(poll.has_voted),
//           total_votes: Number(poll.total_votes) || 0,
//         }));
//         setPolls(normalizedPolls);
//       } else {
//         throw new Error(pollRes.message || "Failed to fetch polls");
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error("Fetch content error:", error);
//       setError(error.message || "Error fetching content");
//       toast.error("Failed to load content. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedFilter]);

//   useEffect(() => {
//     const user = getCurrentUserId();
//     if (user?.id) {
//       fetchCurrentUser();
//     } else {
//       router.push("/sign-in");
//     }
//   }, [fetchCurrentUser, router]);

//   useEffect(() => {
//     if (!isUserLoading && currentUser) {
//       fetchContent();
//     }
//   }, [isUserLoading, currentUser, fetchContent, selectedFilter]);

//   const handleCreatePost = async () => {
//     if (!newPostContent.trim()) {
//       toast.error("Content is required for a post");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const hashtagsArray = newPostHashtags
//         .split(",")
//         .map((h) => h.trim())
//         .filter((h) => h);
//       const body = {
//         content: newPostContent,
//         hashtags: hashtagsArray,
//       };
//       const req: ApiRequestType = {
//         endpoint: "api/news-feed/post",
//         method: "POST",
//         body: body,
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (res.success) {
//         toast.success("Post created successfully");
//         setNewPostContent("");
//         setNewPostHashtags("");
//         const tempPostId = res.data?.post_id || `temp-${Date.now()}`;
//         setPosts(prevPosts => [
//           {
//             post_id: tempPostId,
//             user_id: currentUser?.user_id || "",
//             content: newPostContent,
//             created_at: new Date().toISOString(),
//             username: currentUser?.username || "You",
//             user_type: currentUser?.user_type || "Mentor",
//             hashtags: hashtagsArray,
//             reaction_count: 0,
//             has_reacted: false,
//             comment_count: 0,
//           },
//           ...prevPosts,
//         ]);
//         setSelectedFilter("my-posts");
//         await fetchContent();
//       } else {
//         throw new Error(res.message || "Failed to create post");
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error("Failed to create post:", error.message);
//       toast.error(error.message || "Error creating post");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCreatePoll = async () => {
//     if (!newPollQuestion.trim()) {
//       toast.error("Question is required for a poll");
//       return;
//     }
//     const validOptions = newPollOptions.filter(opt => opt.trim());
//     if (validOptions.length < 2) {
//       toast.error("At least two non-empty options are required");
//       return;
//     }
//     if (!validatePollEndTime(newPollEndTime)) {
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const hashtagsArray = newPollHashtags
//         .split(",")
//         .map((h) => h.trim())
//         .filter((h) => h);
//       const body = {
//         question: newPollQuestion,
//         options: validOptions,
//         end_time: newPollEndTime?.toISOString() || null,
//         hashtags: hashtagsArray,
//       };
//       const req: ApiRequestType = {
//         endpoint: "api/news-feed/poll",
//         method: "POST",
//         body: body,
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (res.success) {
//         toast.success("Poll created successfully");
//         setNewPollQuestion("");
//         setNewPollOptions(["", ""]);
//         setNewPollEndTime(null);
//         setNewPollHashtags("");
//         const tempPollId = res.data?.poll_id || `temp-poll-${Date.now()}`;
//         setPolls(prevPolls => [
//           {
//             poll_id: tempPollId,
//             user_id: currentUser?.user_id || "",
//             question: newPollQuestion,
//             end_time: newPollEndTime?.toISOString() || null,
//             created_at: new Date().toISOString(),
//             username: currentUser?.username || "You",
//             user_type: currentUser?.user_type || "Mentor",
//             hashtags: hashtagsArray,
//             options: validOptions.map(opt => ({
//               option_id: `temp-opt-${Date.now()}-${Math.random()}`,
//               poll_id: tempPollId,
//               option_text: opt,
//               vote_count: 0,
//               has_voted: false,
//             })),
//             has_voted: false,
//             total_votes: 0,
//           },
//           ...prevPolls,
//         ]);
//         setSelectedFilter("my-posts");
//         await fetchContent();
//       } else {
//         throw new Error(res.message || "Failed to create poll");
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error("Failed to create poll:", error.message);
//       toast.error(error.message || "Error creating poll");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEditPost = async (
//     post_id: string,
//     content: string,
//     hashtags: string
//   ) => {
//     if (!content.trim()) {
//       toast.error("Post content cannot be empty");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const hashtagsArray = hashtags
//         .split(",")
//         .map((h) => h.trim())
//         .filter((h) => h);
//       const body = {
//         content,
//         hashtags: hashtagsArray,
//       };
//       setPosts(prevPosts =>
//         prevPosts.map(post =>
//           post.post_id === post_id
//             ? { ...post, content, hashtags: hashtagsArray }
//             : post
//         )
//       );
//       const req: ApiRequestType = {
//         endpoint: `api/news-feed/post/${post_id}`,
//         method: "PUT",
//         body: body,
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (res.success) {
//         toast.success("Post updated successfully");
//         setEditingPost(null);
//       } else {
//         setPosts(prevPosts => [...prevPosts]);
//         throw new Error(res.message || "Failed to update post");
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error("Failed to edit post:", error.message);
//       toast.error(error.message || "Error updating post");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEditPoll = async (
//     poll_id: string,
//     question: string,
//     options: string[],
//     end_time: string | null,
//     hashtags: string
//   ) => {
//     if (!question.trim()) {
//       toast.error("Poll question cannot be empty");
//       return;
//     }
//     const validOptions = options.filter(opt => opt.trim());
//     if (validOptions.length < 2) {
//       toast.error("At least two non-empty options are required");
//       return;
//     }
//     if (end_time && !isBefore(new Date(), new Date(end_time))) {
//       toast.error("Poll end time must be in the future");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const hashtagsArray = hashtags
//         .split(",")
//         .map((h) => h.trim())
//         .filter((h) => h);
//       const body = {
//         question,
//         options: validOptions,
//         end_time: end_time || null,
//         hashtags: hashtagsArray,
//       };
//       setPolls(prevPolls =>
//         prevPolls.map(poll =>
//           poll.poll_id === poll_id
//             ? {
//                 ...poll,
//                 question,
//                 options: validOptions.map(opt => ({
//                   option_id: `temp-opt-${Date.now()}-${Math.random()}`,
//                   poll_id: poll_id,
//                   option_text: opt,
//                   vote_count: 0,
//                   has_voted: false,
//                 })),
//                 end_time,
//                 hashtags: hashtagsArray,
//               }
//             : poll
//         )
//       );
//       const req: ApiRequestType = {
//         endpoint: `api/news-feed/poll/${poll_id}`,
//         method: "PUT",
//         body: body,
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (res.success) {
//         toast.success("Poll updated successfully");
//         setEditingPoll(null);
//       } else {
//         setPolls(prevPolls => [...prevPolls]);
//         throw new Error(res.message || "Failed to update poll");
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error("Failed to edit poll:", error.message);
//       toast.error(error.message || "Error updating poll");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDeletePost = async (post_id: string) => {
//     try {
//       setPosts(prevPosts => prevPosts.filter(post => post.post_id !== post_id));
//       const req: ApiRequestType = {
//         endpoint: `api/news-feed/post/${post_id}`,
//         method: "DELETE",
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (!res.success) {
//         setPosts(prevPosts => [...prevPosts]);
//         throw new Error(res.message || "Failed to delete post");
//       }
//       toast.success("Post deleted successfully");
//     } catch (err) {
//       const error = err as Error;
//       console.error("Failed to delete post:", error.message);
//       toast.error(error.message || "Error deleting post");
//     } finally {
//       setDeleteModal({ isOpen: false, itemId: null, itemType: null });
//       setIsSubmitting(false);
//     }
//   };

//   const handleDeletePoll = async (poll_id: string) => {
//     try {
//       setPolls(prevPolls => prevPolls.filter(poll => poll.poll_id !== poll_id));
//       const req: ApiRequestType = {
//         endpoint: `api/news-feed/poll/${poll_id}`,
//         method: "DELETE",
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (!res.success) {
//         setPolls(prevPolls => [...prevPolls]);
//         throw new Error(res.message || "Failed to delete poll");
//       }
//       toast.success("Poll deleted successfully");
//     } catch (err) {
//       const error = err as Error;
//       console.error("Failed to delete poll:", error.message);
//       toast.error(error.message || "Error deleting poll");
//     } finally {
//       setDeleteModal({ isOpen: false, itemId: null, itemType: null });
//       setIsSubmitting(false);
//     }
//   };

//   // New function to open the delete modal
//   const openDeleteModal = (itemId: string, itemType: "Post" | "Poll") => {
//     setDeleteModal({ isOpen: true, itemId, itemType });
//   };

//   // New function to confirm deletion
//   const confirmDelete = async () => {
//     if (!deleteModal.itemId || !deleteModal.itemType) return;
//     setIsSubmitting(true);
//     if (deleteModal.itemType === "Post") {
//       await handleDeletePost(deleteModal.itemId);
//     } else {
//       await handleDeletePoll(deleteModal.itemId);
//     }
//   };

//   const handleVotePoll = async (poll_id: string, option_id: string, isUpdate: boolean) => {
//     if (isVoting) return;
//     setIsVoting(poll_id);
    
//     try {
//       setPolls(prevPolls =>
//         prevPolls.map(poll => {
//           if (poll.poll_id !== poll_id) return poll;
          
//           const updatedOptions = poll.options.map(opt => ({
//             ...opt,
//             has_voted: opt.option_id === option_id ? !opt.has_voted : false,
//             vote_count: opt.option_id === option_id 
//               ? (isUpdate ? opt.vote_count : opt.vote_count + 1)
//               : (isUpdate && opt.has_voted ? opt.vote_count - 1 : opt.vote_count),
//           }));
          
//           return {
//             ...poll,
//             options: updatedOptions,
//             has_voted: true,
//             total_votes: isUpdate 
//               ? poll.total_votes 
//               : poll.total_votes + 1,
//           };
//         })
//       );

//       const body = { poll_id, option_id };
//       const endpoint = isUpdate ? "api/news-feed/poll/vote/update" : "api/news-feed/poll/vote/add";
//       const method = isUpdate ? "PUT" : "POST";
//       const req: ApiRequestType = {
//         endpoint,
//         method,
//         body,
//         auth: true,
//       };
      
//       const res = await apiRequest(req);
//       if (res.success) {
//         toast.success(isUpdate ? "Vote updated successfully" : "Voted successfully");
//         await fetchContent();
//       } else {
//         setPolls(prevPolls => [...prevPolls]);
//         if (res.status === 400 && res.message.includes("already voted")) {
//           toast.warning("You have already voted for this option");
//         } else {
//           throw new Error(res.message || `Failed to ${isUpdate ? "update" : "cast"} vote`);
//         }
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error(`Failed to ${isUpdate ? "update" : "cast"} vote:`, error.message);
//       if (!error.message.includes("already voted")) {
//         toast.error(error.message || `Error ${isUpdate ? "updating" : "casting"} vote`);
//       }
//     } finally {
//       setIsVoting(null);
//     }
//   };

//   const handleToggleReaction = async (post_id: string, has_reacted: boolean) => {
//     if (isReacting) return;
//     setIsReacting(post_id);

//     setPosts(prevPosts =>
//       prevPosts.map(post =>
//         post.post_id === post_id
//           ? {
//               ...post,
//               reaction_count: has_reacted
//                 ? post.reaction_count - 1
//                 : post.reaction_count + 1,
//               has_reacted: !has_reacted,
//             }
//           : post
//       )
//     );

//     try {
//       const endpoint = has_reacted
//         ? "api/news-feed/reaction/remove"
//         : "api/news-feed/reaction/add";
//       const method = has_reacted ? "DELETE" : "POST";
//       const body = { post_id };

//       const req: ApiRequestType = {
//         endpoint,
//         method,
//         body,
//         auth: true,
//       };

//       const res = await apiRequest(req);

//       if (!res.success) {
//         setPosts(prevPosts =>
//           prevPosts.map(post =>
//             post.post_id === post_id
//               ? {
//                   ...post,
//                   reaction_count: has_reacted
//                     ? post.reaction_count + 1
//                     : post.reaction_count - 1,
//                   has_reacted: has_reacted,
//                 }
//               : post
//           )
//         );

//         if (res.status === 400 && res.message?.includes("already reacted")) {
//           await fetchContent();
//           toast.error("You have already reacted to this post");
//         } else {
//           throw new Error(res.message || `Failed to ${has_reacted ? "remove" : "add"} reaction`);
//         }
//       }
//     } catch (err) {
//       const error = err as Error;
//       console.error(`Failed to ${has_reacted ? "remove" : "add"} reaction:`, error.message);
//       toast.error(error.message || `Error ${has_reacted ? "removing" : "adding"} reaction`);
//     } finally {
//       setIsReacting(null);
//     }
//   };

//   const getPollTimeRemaining = (poll_id: string) => {
//     return countdowns[poll_id] || "No end time";
//   };

//   const addPollOption = () => {
//     setNewPollOptions(prev => [...prev, ""]);
//   };

//   const updatePollOption = (index: number, value: string) => {
//     setNewPollOptions(prev => {
//       const newOptions = [...prev];
//       newOptions[index] = value;
//       return newOptions;
//     });
//   };

//   const removePollOption = (index: number) => {
//     setNewPollOptions(prev => prev.filter((_, i) => i !== index));
//   };

//   const calculateVotePercentage = (voteCount: number, totalVotes: number) => {
//     if (totalVotes === 0) return "0%";
//     return `${Math.round((voteCount / totalVotes) * 100)}%`;
//   };

//   if (isUserLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="flex flex-col items-center space-y-6"
//         >
//           <div className="relative">
//             <motion.div
//               animate={{
//                 rotate: 360,
//                 scale: [1, 1.1, 1],
//               }}
//               transition={{
//                 rotate: { duration: 2, repeat: Infinity, ease: "linear" },
//                 scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
//               }}
//               className="w-16 h-16 border-4 border-slate-700 border-t-amber-500/80 rounded-full"
//             />
//             <motion.div
//               animate={{ rotate: -360 }}
//               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//               className="absolute inset-2 border-2 border-slate-600 border-b-orange-400/60 rounded-full"
//             />
//           </div>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="text-center"
//           >
//             <h3 className="text-white font-semibold mb-2">Loading Profile</h3>
//             <p className="text-slate-400 text-sm">Fetching your profile...</p>
//           </motion.div>
//         </motion.div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-md"
//         >
//           <div className="flex items-center space-x-4">
//             <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
//               <Send className="w-6 h-6 text-red-400" />
//             </div>
//             <div>
//               <h3 className="text-white font-semibold mb-1">Error Loading Newsfeed</h3>
//               <p className="text-slate-400 text-sm">{error}</p>
//             </div>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => {
//               setError(null);
//               fetchContent();
//             }}
//             className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
//           >
//             Try Again
//           </motion.button>
//         </motion.div>
//       </div>
//     );
//   }

//   const combinedContent = [...posts, ...polls].sort(
//     (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
//       <ScrollArea className="h-screen">
//         <div className="max-w-3xl mx-auto p-6 space-y-8">
//           {/* Header Section */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center space-y-6"
//           >
//             <div className="flex items-center justify-center space-x-3">
//               <motion.div
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"
//               >
//                 <Send className="w-7 h-7 text-white" />
//               </motion.div>
//               <div>
//                 <motion.h1
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   className={`${jakarta.className} text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent`}
//                 >
//                   Discussion Forum
//                 </motion.h1>
//                 <motion.p
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.1 }}
//                   className="text-slate-400 text-sm"
//                 >
//                   Share and discover posts and polls
//                 </motion.p>
//               </div>
//             </div>

//             {/* Toggle Switch for Filters */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="flex items-center justify-center space-x-4 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-3"
//             >
//               <span className="text-sm font-semibold text-slate-300">All Content</span>
//               <Switch
//                 checked={selectedFilter === "my-posts"}
//                 onCheckedChange={(checked: boolean) => setSelectedFilter(checked ? "my-posts" : "all")}
//                 className="data-[state=checked]:bg-violet-600"
//                 aria-label="Toggle between all content and my content"
//               />
//               <span className="text-sm font-semibold text-slate-300">My Content</span>
//             </motion.div>
//           </motion.div>

//           {selectedFilter === "my-posts" && (
//             <>
//               {/* Create Post Card */}
//               <motion.div
//                 variants={cardVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
//               >
//                 <motion.div
//                   variants={shimmerVariants}
//                   animate="animate"
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
//                   style={{ backgroundSize: "200% 100%" }}
//                 />
//                 <div className="relative z-10 space-y-4">
//                   <div className="flex items-center space-x-3 mb-4">
//                     <motion.img
//                       whileHover={{ scale: 1.1 }}
//                       src={currentUser ? getAvatar(currentUser.username) : "/placeholder.png"}
//                       alt={currentUser?.name || "User"}
//                       className="w-10 h-10 rounded-xl border-2 border-slate-600/50"
//                     />
//                     <h3 className="text-white font-semibold text-lg">Create a Post</h3>
//                   </div>
//                   <div className="space-y-3">
//                     <textarea
//                       placeholder="What's on your mind?"
//                       value={newPostContent}
//                       onChange={(e) => setNewPostContent(e.target.value)}
//                       className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                       rows={3}
//                       aria-label="Post content"
//                     />
//                     <input
//                       placeholder="Hashtags (comma-separated)"
//                       value={newPostHashtags}
//                       onChange={(e) => setNewPostHashtags(e.target.value)}
//                       className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                       aria-label="Post hashtags"
//                     />
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={handleCreatePost}
//                       disabled={isSubmitting}
//                       className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
//                     >
//                       {isSubmitting ? (
//                         <div className="flex items-center justify-center">
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                           Posting...
//                         </div>
//                       ) : (
//                         <>
//                           <Send className="w-4 h-4 mr-2 inline" />
//                           Create Post
//                         </>
//                       )}
//                     </motion.button>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Create Poll Card */}
//               <motion.div
//                 variants={cardVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
//               >
//                 <motion.div
//                   variants={shimmerVariants}
//                   animate="animate"
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
//                   style={{ backgroundSize: "200% 100%" }}
//                 />
//                 <div className="relative z-10 space-y-4">
//                   <div className="flex items-center space-x-3 mb-4">
//                     <motion.img
//                       whileHover={{ scale: 1.1 }}
//                       src={currentUser ? getAvatar(currentUser.username) : "/placeholder.png"}
//                       alt={currentUser?.name || "User"}
//                       className="w-10 h-10 rounded-xl border-2 border-slate-600/50"
//                     />
//                     <h3 className="text-white font-semibold text-lg">Create a Poll</h3>
//                   </div>
//                   <div className="space-y-3">
//                     <input
//                       placeholder="Poll question"
//                       value={newPollQuestion}
//                       onChange={(e) => setNewPollQuestion(e.target.value)}
//                       className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                       aria-label="Poll question"
//                     />
//                     {newPollOptions.map((option, index) => (
//                       <div key={index} className="flex items-center space-x-2">
//                         <input
//                           placeholder={`Option ${index + 1}`}
//                           value={option}
//                           onChange={(e) => updatePollOption(index, e.target.value)}
//                           className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                           aria-label={`Poll option ${index + 1}`}
//                         />
//                         {newPollOptions.length > 2 && (
//                           <motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => removePollOption(index)}
//                             className="text-red-400 hover:text-red-500 p-2"
//                             aria-label="Remove poll option"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </motion.button>
//                         )}
//                       </div>
//                     ))}
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={addPollOption}
//                       className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
//                     >
//                       Add Option
//                     </motion.button>
//                     <div className="space-y-2">
//                       <span className="text-sm font-semibold text-slate-300">End Time</span>
//                       <DateTimePicker
//                         field={{
//                           value: newPollEndTime || new Date(),
//                           onChange: (val: Date) => {
//                             setNewPollEndTime(val);
//                             validatePollEndTime(val);
//                           },
//                         }}
//                         classnames="bg-slate-700/20 text-white rounded-lg border border-slate-600/30 focus:ring-2 focus:ring-violet-500/50"
//                       />
//                       {timeError && (
//                         <span className="text-red-400 text-sm">{timeError}</span>
//                       )}
//                     </div>
//                     <input
//                       placeholder="Hashtags (comma-separated)"
//                       value={newPollHashtags}
//                       onChange={(e) => setNewPollHashtags(e.target.value)}
//                       className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                       aria-label="Poll hashtags"
//                     />
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={handleCreatePoll}
//                       disabled={isSubmitting || !!timeError}
//                       className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
//                     >
//                       {isSubmitting ? (
//                         <div className="flex items-center justify-center">
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                           Creating...
//                         </div>
//                       ) : (
//                         <>
//                           <Vote className="w-4 h-4 mr-2 inline" />
//                           Create Poll
//                         </>
//                       )}
//                     </motion.button>
//                   </div>
//                 </div>
//               </motion.div>
//             </>
//           )}

//           <AnimatePresence>
//             {isLoading ? (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="text-center py-8"
//               >
//                 <div className="relative">
//                   <motion.div
//                     animate={{
//                       rotate: 360,
//                       scale: [1, 1.1, 1],
//                     }}
//                     transition={{
//                       rotate: { duration: 2, repeat: Infinity, ease: "linear" },
//                       scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
//                     }}
//                     className="w-16 h-16 border-4 border-slate-700 border-t-amber-500/80 rounded-full mx-auto"
//                   />
//                 </div>
//                 <p className="text-white mt-4">Loading content...</p>
//               </motion.div>
//             ) : combinedContent.length === 0 ? (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-16 text-center"
//               >
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
//                   className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
//                 >
//                   <Send className="w-10 h-10 text-slate-400" />
//                 </motion.div>
//                 <motion.h3
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="text-xl font-bold text-white mb-3"
//                 >
//                   {selectedFilter === "all" ? "No content available" : "No content created"}
//                 </motion.h3>
//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.4 }}
//                   className="text-slate-400 mb-6"
//                 >
//                   {selectedFilter === "all"
//                     ? "Be the first to post or create a poll!"
//                     : "Create your first post or poll!"}
//                 </motion.p>
//                 {selectedFilter === "my-posts" && (
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setSelectedFilter("all")}
//                     className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
//                   >
//                     View All Content
//                   </motion.button>
//                 )}
//               </motion.div>
//             ) : (
//               <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="space-y-6"
//               >
//                 {combinedContent.map((item) => (
//                   "post_id" in item ? (
//                     <motion.div
//                       key={item.post_id}
//                       variants={cardVariants}
//                       whileHover="hover"
//                       className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
//                     >
//                       <motion.div
//                         className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//                         initial={false}
//                       />
//                       <div className="relative z-10 space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-3">
//                             <motion.img
//                               whileHover={{ scale: 1.1 }}
//                               src={getAvatar(item.username)}
//                               alt={item.username}
//                               className="w-10 h-10 rounded-xl border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300"
//                             />
//                             <div>
//                               <p className="text-white font-semibold group-hover:text-amber-200 transition-colors duration-300">{item.username}</p>
//                               <p className="text-slate-400 text-xs">{formatDate(item.created_at)}</p>
//                             </div>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Badge
//                               variant="outline"
//                               className={`${
//                                 item.user_type === "Mentor"
//                                   ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
//                                   : item.user_type === "Student"
//                                   ? "bg-green-500/20 text-green-400 border-green-500/30"
//                                   : "bg-purple-500/20 text-purple-400 border-purple-500/30"
//                               }`}
//                             >
//                               {item.user_type}
//                             </Badge>
//                             {(item.user_id === currentUser?.user_id || selectedFilter === "my-posts") && (
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
//                                     <MoreVertical className="w-4 h-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent className="w-40 bg-slate-800/95 border border-slate-700/50 text-white">
//                                   <DropdownMenuItem
//                                     className="flex items-center space-x-2 hover:bg-slate-700/50"
//                                     onClick={() =>
//                                       setEditingPost({
//                                         post_id: item.post_id,
//                                         content: item.content,
//                                         hashtags: item.hashtags.join(", "),
//                                       })
//                                     }
//                                   >
//                                     <Edit3 className="w-4 h-4" />
//                                     <span>Edit</span>
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem
//                                     className="flex items-center space-x-2 text-red-400 hover:bg-slate-700/50"
//                                     onClick={() => openDeleteModal(item.post_id, "Post")}
//                                   >
//                                     <Trash2 className="w-4 h-4" />
//                                     <span>Delete</span>
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             )}
//                           </div>
//                         </div>
//                         <div className="pb-3 border-b border-slate-700/30">
//                           <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.content}</p>
//                         </div>
//                         {item.hashtags.length > 0 && (
//                           <div className="flex flex-wrap gap-2">
//                             {item.hashtags.map((hashtag, index) => (
//                               <Badge
//                                 key={index}
//                                 variant="outline"
//                                 className="bg-blue-500/20 text-blue-400 border-blue-500/30"
//                               >
//                                 #{hashtag}
//                               </Badge>
//                             ))}
//                           </div>
//                         )}
//                         <Comments
//                           postId={item.post_id}
//                           commentCount={item.comment_count}
//                           currentUser={currentUser}
//                           onReactionToggle={handleToggleReaction}
//                           isReacting={isReacting}
//                           hasReacted={item.has_reacted}
//                           reactionCount={item.reaction_count}
//                         />
//                       </div>
//                     </motion.div>
//                   ) : (
//                     <motion.div
//                       key={item.poll_id}
//                       variants={cardVariants}
//                       whileHover="hover"
//                       className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 overflow-hidden"
//                     >
//                       <motion.div
//                         className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//                         initial={false}
//                       />
//                       <div className="relative z-10 space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-3">
//                             <motion.img
//                               whileHover={{ scale: 1.1 }}
//                               src={getAvatar(item.username)}
//                               alt={item.username}
//                               className="w-10 h-10 rounded-xl border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300"
//                             />
//                             <div>
//                               <p className="text-white font-semibold group-hover:text-amber-200 transition-colors duration-300">{item.username}</p>
//                               <p className="text-slate-400 text-xs">{formatDate(item.created_at)}</p>
//                             </div>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Badge
//                               variant="outline"
//                               className={`${
//                                 item.user_type === "Mentor"
//                                   ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
//                                   : item.user_type === "Student"
//                                   ? "bg-green-500/20 text-green-400 border-green-500/30"
//                                   : "bg-purple-500/20 text-purple-400 border-purple-500/30"
//                               }`}
//                             >
//                               {item.user_type}
//                             </Badge>
//                             {(item.user_id === currentUser?.user_id || selectedFilter === "my-posts") && (
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
//                                     <MoreVertical className="w-4 h-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent className="w-40 bg-slate-800/95 border border-slate-700/50 text-white">
//                                   <DropdownMenuItem
//                                     className="flex items-center space-x-2 hover:bg-slate-700/50"
//                                     onClick={() =>
//                                       setEditingPoll({
//                                         poll_id: item.poll_id,
//                                         question: item.question,
//                                         options: item.options.map(opt => opt.option_text),
//                                         end_time: item.end_time,
//                                         hashtags: item.hashtags.join(", "),
//                                       })
//                                     }
//                                   >
//                                     <Edit3 className="w-4 h-4" />
//                                     <span>Edit</span>
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem
//                                     className="flex items-center space-x-2 text-red-400 hover:bg-slate-700/50"
//                                     onClick={() => openDeleteModal(item.poll_id, "Poll")}
//                                   >
//                                     <Trash2 className="w-4 h-4" />
//                                     <span>Delete</span>
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             )}
//                           </div>
//                         </div>
//                         <div className="pb-3 border-b border-slate-700/30">
//                           <p className="text-white font-semibold text-sm">{item.question}</p>
//                           <p className="text-slate-400 text-xs">{getPollTimeRemaining(item.poll_id)}</p>
//                         </div>
//                         {item.options.map((option, index) => (
//                           <motion.div
//                             key={option.option_id}
//                             whileHover={{ scale: 1.01 }}
//                             whileTap={{ scale: 0.99 }}
//                             className="mb-2"
//                           >
//                             <Button
//                               variant="outline"
//                               className={cn(
//                                 "w-full text-left justify-between transition-all duration-200 text-sm",
//                                 item.end_time && new Date(item.end_time) < new Date()
//                                   ? "bg-slate-700/20 cursor-not-allowed text-slate-400"
//                                   : option.has_voted
//                                   ? "bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30"
//                                   : item.has_voted
//                                   ? "bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30"
//                                   : "bg-slate-700/20 border-slate-600/30 text-slate-300 hover:bg-slate-700/30 hover:border-amber-500/30",
//                                 "group-hover:shadow-md"
//                               )}
//                               onClick={() => {
//                                 if (option.has_voted) {
//                                   toast.warning("You've already voted for this option");
//                                 } else if (!item.has_voted || (item.end_time && new Date(item.end_time) >= new Date())) {
//                                   handleVotePoll(item.poll_id, option.option_id, item.has_voted);
//                                 }
//                               }}
//                               disabled={Boolean(
//                                 isVoting === item.poll_id || 
//                                 (item.end_time && new Date(item.end_time) < new Date())
//                               )}
//                             >
//                               <span>{option.option_text}</span>
//                               <span className="flex items-center text-xs">
//                                 {option.vote_count} votes ({calculateVotePercentage(option.vote_count, item.total_votes)})
//                                 {option.has_voted && (
//                                   <Check className="w-4 h-4 ml-2 text-green-400" />
//                                 )}
//                               </span>
//                             </Button>
//                           </motion.div>
//                         ))}
//                         {item.hashtags.length > 0 && (
//                           <div className="flex flex-wrap gap-2">
//                             {item.hashtags.map((hashtag, index) => (
//                               <Badge
//                                 key={index}
//                                 variant="outline"
//                                 className="bg-blue-500/20 text-blue-400 border-blue-500/30"
//                               >
//                                 #{hashtag}
//                               </Badge>
//                             ))}
//                           </div>
//                         )}
//                         <div className="text-slate-400 text-xs">
//                           Total votes: {item.total_votes}
//                         </div>
//                       </div>
//                     </motion.div>
//                   )
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {editingPost && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
//             >
//               <motion.div
//                 variants={cardVariants}
//                 className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md w-full"
//               >
//                 <h3 className="text-white font-semibold text-lg mb-4">Edit Post</h3>
//                 <div className="space-y-3">
//                   <textarea
//                     value={editingPost.content}
//                     onChange={(e) =>
//                       setEditingPost({ ...editingPost, content: e.target.value })
//                     }
//                     className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                     rows={3}
//                     aria-label="Edit post content"
//                   />
//                   <input
//                     value={editingPost.hashtags}
//                     onChange={(e) =>
//                       setEditingPost({ ...editingPost, hashtags: e.target.value })
//                     }
//                     placeholder="Hashtags (comma-separated)"
//                     className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                     aria-label="Edit post hashtags"
//                   />
//                   <div className="flex justify-end space-x-2">
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => setEditingPost(null)}
//                       className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
//                     >
//                       Cancel
//                     </motion.button>
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() =>
//                         handleEditPost(
//                           editingPost.post_id,
//                           editingPost.content,
//                           editingPost.hashtags
//                         )
//                       }
//                       disabled={isSubmitting}
//                       className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
//                     >
//                       {isSubmitting ? (
//                         <div className="flex items-center justify-center">
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                           Saving...
//                         </div>
//                       ) : (
//                         "Save"
//                       )}
//                     </motion.button>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}

//           {editingPoll && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
//             >
//               <motion.div
//                 variants={cardVariants}
//                 className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md w-full"
//               >
//                 <h3 className="text-white font-semibold text-lg mb-4">Edit Poll</h3>
//                 <div className="space-y-3">
//                   <input
//                     value={editingPoll.question}
//                     onChange={(e) =>
//                       setEditingPoll({ ...editingPoll, question: e.target.value })
//                     }
//                     className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                     aria-label="Edit poll question"
//                   />
//                   {editingPoll.options.map((option, index) => (
//                     <div key={index} className="flex items-center space-x-2">
//                       <input
//                         value={option}
//                         onChange={(e) =>
//                           setEditingPoll({
//                             ...editingPoll,
//                             options: editingPoll.options.map((opt, i) =>
//                               i === index ? e.target.value : opt
//                             ),
//                           })
//                         }
//                         className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                         aria-label={`Edit poll option ${index + 1}`}
//                       />
//                       {editingPoll.options.length > 2 && (
//                         <motion.button
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                           onClick={() =>
//                             setEditingPoll({
//                               ...editingPoll,
//                               options: editingPoll.options.filter((_, i) => i !== index),
//                             })
//                           }
//                           className="text-red-400 hover:text-red-500 p-2"
//                           aria-label="Remove poll option"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </motion.button>
//                       )}
//                     </div>
//                   ))}
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() =>
//                       setEditingPoll({
//                         ...editingPoll,
//                         options: [...editingPoll.options, ""],
//                       })
//                     }
//                     className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
//                   >
//                     Add Option
//                   </motion.button>
//                   <div className="space-y-2">
//                     <span className="text-sm font-semibold text-slate-300">End Time</span>
//                     <DateTimePicker
//                       field={{
//                         value: editingPoll.end_time ? new Date(editingPoll.end_time) : new Date(),
//                         onChange: (val: Date) => {
//                           setEditingPoll({ ...editingPoll, end_time: val.toISOString() });
//                           validatePollEndTime(val);
//                         },
//                       }}
//                       classnames="bg-slate-700/20 text-white rounded-lg border border-slate-600/30 focus:ring-2 focus:ring-violet-500/50"
//                     />
//                     {timeError && (
//                       <span className="text-red-400 text-sm">{timeError}</span>
//                     )}
//                   </div>
//                   <input
//                     value={editingPoll.hashtags}
//                     onChange={(e) =>
//                       setEditingPoll({ ...editingPoll, hashtags: e.target.value })
//                     }
//                     placeholder="Hashtags (comma-separated)"
//                     className="w-full bg-slate-700/20 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
//                     aria-label="Edit poll hashtags"
//                   />
//                   <div className="flex justify-end space-x-2">
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => setEditingPoll(null)}
//                       className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
//                     >
//                       Cancel
//                     </motion.button>
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() =>
//                         handleEditPoll(
//                           editingPoll.poll_id,
//                           editingPoll.question,
//                           editingPoll.options,
//                           editingPoll.end_time,
//                           editingPoll.hashtags
//                         )
//                       }
//                       disabled={isSubmitting || !!timeError}
//                       className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
//                     >
//                       {isSubmitting ? (
//                         <div className="flex items-center justify-center">
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                           Saving...
//                         </div>
//                       ) : (
//                         "Save"
//                       )}
//                     </motion.button>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}

//           {/* Delete Confirmation Modal */}
//           <DeleteConfirmModal
//             isOpen={deleteModal.isOpen}
//             onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemType: null })}
//             onConfirm={confirmDelete}
//             isDeleting={isSubmitting}
//             itemType={deleteModal.itemType || "Post"}
//           />
//         </div>
//       </ScrollArea>
//     </div>
//   );
// };

// export default MentorNewsFeed;
