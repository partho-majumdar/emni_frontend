"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { Star, User, BookOpen, Calendar, Clock, MapPin, Users, DollarSign, GraduationCap, X, Mail, Sparkles, Zap, TrendingUp, MessageCircle, Send, MoreVertical, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MentorDetails {
  mentorId: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  gender: string | null;
  dateOfBirth: string | null;
  graduationYear: number | null;
  profileImage: string | null;
  bio: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  interests: string[];
  socialMedia: { platform: string; url: string }[];
  statistics: {
    oneOnOneSessions: number;
    groupSessions: number;
    totalSessions: number;
    groupSessionParticipants: number;
    averageRating: string;
    totalReviews: number;
  };
  sessions: Array<
    | {
        session: {
          session_id: string;
          session_type: "OneOnOne";
          session_title: string;
          type: string;
          description: string;
          duration_mins: number;
          price: number;
          is_online: boolean;
          is_offline: boolean;
        };
        reviews: Array<{
          review_id: string;
          rating: number;
          review_text: string;
          created_at: string;
          student: {
            student_id: string;
            name: string;
            username: string;
            email: string;
          };
        }>;
      }
    | {
        session: {
          session_id: string;
          session_type: "Group";
          session_title: string;
          description: string;
          start_time: string;
          end_time: string;
          duration_mins: number;
          max_participants: number;
          registered_participants: number;
          platform: string;
          status: string;
        };
        reviews: Array<{
          review_id: string;
          rating: number;
          review_text: string;
          created_at: string;
          student: {
            student_id: string;
            name: string;
            username: string;
            email: string;
          };
        }>;
      }
  >;
}

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
  };
  mentor: {
    mentor_id: string;
    user_id: string;
    name: string;
  };
  messages: Message[];
}

interface ApiResponse {
  success: boolean;
  data: MentorDetails | Conversation | Message;
  message?: string;
}

const getAvatar = (username: string): string => {
  return `https://robohash.org/${username}.png?size=120x120`;
};

const MentorProfile: React.FC = () => {
  const [mentor, setMentor] = useState<MentorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<MentorDetails['sessions'][number] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const mentorId = params.mentor_id as string;

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const request: ApiRequestType = {
          endpoint: `api/mentor/findmentor/details/${mentorId}`,
          method: "GET",
          auth: true,
        };

        const response = await apiRequest(request) as ApiResponse;

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch mentor details");
        }

        if ("mentorId" in response.data) {
          setMentor(response.data as MentorDetails);
        } else {
          throw new Error("Invalid mentor details response");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An error occurred while fetching mentor details";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorDetails();
    }
  }, [mentorId]);

  useEffect(() => {
    if (isChatOpen && mentorId) {
      fetchConversation();
      markMessagesAsRead();
    }
  }, [isChatOpen, mentorId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const fetchConversation = async () => {
    try {
      setChatError(null);
      const request: ApiRequestType = {
        endpoint: `api/messages/conversations/mentor/${mentorId}`,
        method: "GET",
        auth: true,
      };

      const response = await apiRequest(request) as ApiResponse;

      if (response.success) {
        setConversation(response.data as Conversation);
      } else if (response.message === "Conversation not found" || response.message === "Student or mentor not found") {
        const startRequest: ApiRequestType = {
          endpoint: `api/messages/conversations/${mentorId}`,
          method: "POST",
          auth: true,
        };
        const startResponse = await apiRequest(startRequest) as ApiResponse;
        if (startResponse.success) {
          setConversation(startResponse.data as Conversation);
        } else {
          throw new Error(startResponse.message || "Failed to start conversation");
        }
      } else {
        throw new Error(response.message || "Failed to fetch conversation");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while fetching conversation";
      setChatError(message);
      toast.error(message);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !conversation) return;

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
          setConversation({
            ...conversation,
            messages: conversation.messages.map(msg =>
              msg.message_id === editingMessageId
                ? { ...msg, message_text: messageText.trim(), sent_at: new Date().toISOString() }
                : msg
            ),
          });
          setMessageText("");
          setEditingMessageId(null);
        } else {
          throw new Error(response.message || "Failed to update message");
        }
      } else {
        const request: ApiRequestType = {
          endpoint: `api/messages/messages/${conversation.conversation_id}`,
          method: "POST",
          auth: true,
          body: { message_text: messageText.trim() },
        };

        const response = await apiRequest(request) as ApiResponse;

        if (response.success) {
          const newMessage = response.data as Message;
          setConversation({
            ...conversation,
            messages: [...conversation.messages, newMessage],
          });
          setMessageText("");
        } else {
          throw new Error(response.message || "Failed to send message");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while processing message";
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
    if (!conversation) return;

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
        setConversation({
          ...conversation,
          messages: conversation.messages.map(msg =>
            msg.message_id === messageId
              ? { ...msg, is_deleted: true, message_text: "[Deleted]" }
              : msg
          ),
        });
      } else {
        throw new Error(response.message || "Failed to delete message");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while deleting message";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const cancelEdit = () => {
    setMessageText("");
    setEditingMessageId(null);
  };

  const markMessagesAsRead = async () => {
    if (!conversation) return;

    try {
      const request: ApiRequestType = {
        endpoint: `api/messages/conversations/${conversation.conversation_id}/read`,
        method: "PUT",
        auth: true,
      };

      const response = await apiRequest(request) as ApiResponse;

      if (response.success) {
        setConversation({
          ...conversation,
          messages: conversation.messages.map(msg => ({
            ...msg,
            is_read: true,
            read_at: msg.is_read ? msg.read_at : new Date().toISOString(),
          })),
        });
      }
    } catch (err: unknown) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const formatDateTime = (dateString: string, isReviewTime: boolean = false) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error(`Invalid date string: ${dateString}`);
        return 'Invalid Date';
      }

      if (!isReviewTime) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC',
        });
      }

      const utcYear = date.getUTCFullYear();
      const utcMonth = date.getUTCMonth();
      const utcDate = date.getUTCDate();
      const utcHours = date.getUTCHours();
      const utcMinutes = date.getUTCMinutes();
      const localTime = new Date(utcYear, utcMonth, utcDate, utcHours, utcMinutes);
      return localTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid Date';
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={`star-${i}`}
            className="relative w-4 h-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          >
            {i < fullStars ? (
              <Star className="w-4 h-4 text-orange-400 fill-orange-400 drop-shadow-sm" />
            ) : i === fullStars && hasHalfStar ? (
              <>
                <Star className="w-4 h-4 text-gray-600" />
                <Star className="w-4 h-4 text-orange-400 fill-orange-400 absolute top-0 left-0" style={{ clipPath: "inset(0 50% 0 0)" }} />
              </>
            ) : (
              <Star className="w-4 h-4 text-gray-600" />
            )}
          </motion.span>
        ))}
      </div>
    );
  };

  const levelColors = {
    Beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Advanced: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Expert: "bg-orange-500/20 text-orange-300 border-orange-500/30",
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
            <h3 className="text-white font-semibold mb-2">Loading Mentor Profile</h3>
            <p className="text-slate-400 text-sm">
              Preparing your experience...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error || !mentor) {
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
              <p className="text-gray-400 text-sm">{error || "Mentor not found"}</p>
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
    <div className="min-h-screen bg-gray-900/50 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <ScrollArea className="h-screen [&::-webkit-scrollbar]:bg-gray-900/50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          {/* Mentor Profile Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex flex-col items-center lg:items-start">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img
                    src={mentor.profileImage || getAvatar(mentor.username)}
                    alt={`${mentor.name}'s profile`}
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-full object-cover ring-2 ring-orange-500/30 shadow-lg"
                    onError={(e) => { e.currentTarget.src = getAvatar(mentor.username); }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`mt-4 px-4 py-1 rounded-lg ${levelColors[mentor.level]} font-semibold text-sm`}
                >
                  {mentor.level}
                </motion.div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl lg:text-4xl font-bold text-white"
                    >
                      {mentor.name}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-400 text-lg"
                    >
                      @{mentor.username}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsChatOpen(true)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 transition-all duration-300 shadow-md flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Send Message
                    </motion.button>
                    <a
                      href={`mailto:${mentor.email}`}
                      className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-orange-500/20 hover:text-orange-300 transition-all duration-300 shadow-md flex items-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </a>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-orange-500/10"
                >
                  {renderStars(parseFloat(mentor.statistics.averageRating))}
                  <span className="text-lg font-semibold text-orange-400">
                    {mentor.statistics.averageRating}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({mentor.statistics.totalReviews} reviews)
                  </span>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 p-3 bg-gray-700/50 rounded-lg border border-orange-500/10"
                >
                  {mentor.bio}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  {[
                    { icon: Users, label: "1-on-1 Sessions", value: mentor.statistics.oneOnOneSessions, color: "bg-blue-500/20" },
                    { icon: BookOpen, label: "Group Sessions", value: mentor.statistics.groupSessions, color: "bg-emerald-500/20" },
                    { icon: TrendingUp, label: "Total Sessions", value: mentor.statistics.totalSessions, color: "bg-purple-500/20" },
                    { icon: Users, label: "Participants", value: mentor.statistics.groupSessionParticipants, color: "bg-orange-500/20" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className={`${stat.color} p-3 rounded-lg border border-orange-500/10 hover:bg-opacity-30 transition-all duration-300`}
                    >
                      <stat.icon className="w-5 h-5 text-white mb-2" />
                      <p className="text-xl font-semibold text-white">{stat.value}</p>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div className="space-y-2">
                    {mentor.dateOfBirth && (
                      <div className="flex items-center gap-2 p-3 bg-gray-700/25 rounded-lg border border-orange-500/10">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-300">{formatDateTime(mentor.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {mentor.graduationYear && (
                      <div className="flex items-center gap-2 p-3 bg-gray-700/25 rounded-lg border border-orange-500/10">
                        <GraduationCap className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-300">{mentor.graduationYear}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
                {mentor.interests.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-300">Skilled</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {mentor.interests.map((interest, i) => (
                        <motion.span
                          key={`interest-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.9 + i * 0.05 }}
                          className="px-4 py-2 text-sm bg-orange-600/30 text-orange-400 rounded-full border border-orange-500/30 hover:bg-orange-600/40"
                        >
                          {interest}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
                {mentor.socialMedia.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-300">Social Media</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {mentor.socialMedia.map((social, i) => (
                        <motion.a
                          key={`social-${i}`}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 1 + i * 0.05 }}
                          className="px-4 py-2 text-sm bg-gray-700/60 text-gray-300 rounded-full border border-orange-500/30 hover:bg-orange-600/30 hover:text-orange-400"
                        >
                          {social.platform}
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Chat Modal */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70"
                onClick={() => {
                  setIsChatOpen(false);
                  cancelEdit();
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/90 rounded-2xl p-6 max-w-2xl w-[90%] max-h-[80vh] flex flex-col border border-orange-500/30 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Chat with {mentor.name}
                    </h3>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsChatOpen(false);
                        cancelEdit();
                      }}
                      className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center text-white hover:bg-orange-500/50 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                  {chatError ? (
                    <div className="text-center py-12">
                      <X className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-300 text-lg">{chatError}</p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchConversation}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 transition-all duration-300"
                      >
                        Retry
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto space-y-4 mb-4 [&::-webkit-scrollbar]:bg-gray-900/50"
                      >
                        {conversation?.messages.length ? (
                          conversation.messages.map((msg, index) => (
                            <motion.div
                              key={`message-${msg.message_id}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex ${
                                msg.sender_type === "Student" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div className="relative max-w-[70%]">
                                <div
                                  className={`p-3 rounded-lg ${
                                    msg.sender_type === "Student"
                                      ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                      : "bg-gray-700/50 text-gray-300 border-gray-500/30"
                                  } border group`}
                                >
                                  <p className="text-sm">{msg.message_text}</p>
                                  <span className="text-xs text-gray-400 block mt-1">
                                    {formatDateTime(msg.sent_at)}
                                    {msg.sender_type === "Student" && msg.is_read && (
                                      <span className="ml-2">✓</span>
                                    )}
                                  </span>
                                  {msg.sender_type === "Student" && !msg.is_deleted && (
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
                          <div className="text-center py-12">
                            <MessageCircle className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
                            <p className="text-gray-300 text-lg">Start your conversation with {mentor.name}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
                          placeholder={editingMessageId ? "Edit your message..." : "Type your message..."}
                          className="flex-1 p-3 bg-gray-700/50 text-gray-300 rounded-lg border border-orange-500/30 focus:outline-none focus:border-orange-500"
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
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews Modal */}
          <AnimatePresence>
            {selectedSession && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70"
                onClick={() => setSelectedSession(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/90 rounded-2xl p-6 max-w-2xl w-[90%] max-h-[80vh] overflow-auto border border-orange-500/30 shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-800/90 py-4 border-b border-orange-500/20">
                      <h3 className="text-xl font-bold text-white">
                        {selectedSession.session.session_title} Reviews
                      </h3>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedSession(null)}
                        className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center text-white hover:bg-orange-500/50 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                    {selectedSession.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {selectedSession.reviews.map((review, rIndex) => (
                          <motion.div
                            key={`${selectedSession.session.session_id}-review-${review.review_id}-${rIndex}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rIndex * 0.1 }}
                            className="p-4 bg-gray-700/30 rounded-xl border border-orange-500/10 hover:bg-gray-700/50 transition-all duration-300"
                          >
                            <div className="flex gap-3 items-start mb-3">
                              <img
                                src={getAvatar(review.student.username)}
                                alt={`${review.student.username}'s avatar`}
                                className="w-12 h-12 rounded-full ring-2 ring-orange-500/20"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-semibold">
                                    @{review.student.username}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(review.created_at, true)}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">{review.review_text}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-300 text-lg">No reviews for this session yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* One-on-One Sessions */}
          {mentor.sessions.filter(s => s.session.session_type === "OneOnOne").length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">One-on-One Sessions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentor.sessions
                  .filter(s => s.session.session_type === "OneOnOne")
                  .map((session, index) => (
                    <motion.div
                      key={`${session.session.session_type}-${session.session.session_id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/30 transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{session.session.session_title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">{session.session.description}</p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">{session.session.duration_mins} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">
                            {"price" in session.session ? `${session.session.price} UCOIN` : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">
                            {"is_online" in session.session && "is_offline" in session.session
                              ? session.session.is_online && session.session.is_offline
                                ? "Online & Offline"
                                : session.session.is_online
                                ? "Online"
                                : "Offline"
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSession(session)}
                        className="w-full mt-4 bg-orange-500/20 text-orange-300 py-2 rounded-lg text-sm hover:bg-orange-500/30 border border-orange-500/30 transition-all duration-300"
                      >
                        See Reviews
                      </motion.button>
                    </motion.div>
                  ))}
              </div>
              <div className="flex justify-center">
                <Link
                  href="/s/sessions"
                  className="inline-block bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-500 transition-all duration-300 shadow-md hover:shadow-lg mx-auto"
                  aria-label="Book a one-on-one session"
                >
                  Book One-on-One Session
                </Link>
              </div>
            </motion.section>
          )}

          {/* Group Sessions */}
          {mentor.sessions.filter(s => s.session.session_type === "Group").length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Group Sessions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentor.sessions
                  .filter(s => s.session.session_type === "Group")
                  .map((session, index) => (
                    <motion.div
                      key={`${session.session.session_type}-${session.session.session_id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/30 transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{session.session.session_title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">{session.session.description}</p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">
                            {"start_time" in session.session
                              ? formatDateTime(session.session.start_time)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">{session.session.duration_mins} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">
                            {"registered_participants" in session.session && "max_participants" in session.session
                              ? `${session.session.registered_participants}/${session.session.max_participants} Participants`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSession(session)}
                        className="w-full mt-4 bg-orange-500/20 text-orange-300 py-2 rounded-lg text-sm hover:bg-orange-500/30 border border-orange-500/30 transition-all duration-300"
                      >
                        See Reviews
                      </motion.button>
                    </motion.div>
                  ))}
              </div>
              <div className="flex justify-center">
                <Link
                  href="/s/group-sessions"
                  className="inline-block bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-500 transition-all duration-300 shadow-md hover:shadow-lg mx-auto"
                  aria-label="Join a group session"
                >
                  Join Group Session
                </Link>
              </div>
            </motion.section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MentorProfile;