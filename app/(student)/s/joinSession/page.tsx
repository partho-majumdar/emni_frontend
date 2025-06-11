"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Video, 
  MapPin, 
  Check, 
  X, 
  ExternalLink,
  CalendarDays,
  BookOpen,
  User,
  GraduationCap,
  AlertCircle,
  Link as LinkIcon,
  ArrowRight,
  Mail,
  DollarSign,
  Star
} from "lucide-react";

// Interface for mentor data
interface Mentor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  username: string;
  image_url: string | null;
}

// Interface for session info
interface SessionInfo {
  id?: string;
  title: string;
  description: string;
  type?: string;
  duration: number;
  price?: number;
  is_online?: boolean;
  is_offline?: boolean;
  created_at?: Date;
  max_participants?: number;
  platform?: string;
  status?: string;
}

// Interface for booked session data
interface BookedSession {
  session_type: "1:1" | "group";
  booking_id: string;
  start: Date;
  end: Date;
  mentor: Mentor;
  session_info: SessionInfo;
  time_slot?: {
    status: string;
    booked_at: Date;
  };
  meeting_details?: {
    medium: "online" | "offline";
    place: string | null;
    online_link: string | null;
  };
  payment_info?: {
    transaction_id: string;
    amount: number;
    status: string;
  };
  booking_details?: {
    participation_status: string;
    booked_at: Date;
  };
}

// Avatar utility function
export function getAvatar(username: string): string {
  return `https://robohash.org/${username}.png?size=200x200`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 25,
      mass: 1
    }
  }
};

const sessionCardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20
    }
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    }
  }
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

export default function StudentBookedSessionsPage() {
  const [sessions, setSessions] = useState<BookedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'one_on_one' | 'group' | 'one_on_one_completed' | 'group_completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reviewingSession, setReviewingSession] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewedSessions, setReviewedSessions] = useState<Set<string>>(new Set());
  const studentId = typeof window !== "undefined" ? localStorage.getItem("student-id") : null;

  const fetchBookedSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const req: ApiRequestType = {
        endpoint: "api/student/booked/s/all",
        method: "GET",
        auth: true,
      };

      const res = await apiRequest(req);
      
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch booked sessions");
      }

      const sessionsWithDates = res.data.map((session: any) => ({
        ...session,
        start: new Date(session.start),
        end: new Date(session.end),
        ...(session.time_slot && {
          time_slot: {
            ...session.time_slot,
            booked_at: new Date(session.time_slot.booked_at)
          }
        }),
        ...(session.booking_details && {
          booking_details: {
            ...session.booking_details,
            booked_at: new Date(session.booking_details.booked_at)
          }
        })
      }));

      setSessions(sessionsWithDates);
      await checkExistingReviews(sessionsWithDates);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching sessions");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReviews = async (sessionsToCheck: BookedSession[] = sessions) => {
    if (!studentId) {
      console.error("No student ID found in localStorage");
      return;
    }

    try {
      const reviewPromises = sessionsToCheck
        .filter(session => getSessionStatus(session.start, session.end) === "Completed")
        .map(async (session) => {
          const endpoint = session.session_type === "1:1"
            ? `api/student/review/one-on-one/${session.booking_id}`
            : `api/student/review/group/${session.booking_id}`;
          
          const req: ApiRequestType = {
            endpoint,
            method: "GET",
            auth: true,
          };

          const res = await apiRequest(req);
          if (res.success && res.data) {
            if (session.session_type === "group" && res.data.reviews) {
              const hasReviewed = res.data.reviews.some(
                (review: any) => review.student_id === studentId
              );
              return hasReviewed ? session.booking_id : null;
            }
            if (session.session_type === "1:1" && res.data.review_id) {
              return session.booking_id;
            }
          }
          return null;
        });

      const reviewedIds = (await Promise.all(reviewPromises)).filter(id => id !== null);
      setReviewedSessions(new Set(reviewedIds));
    } catch (err) {
      console.error("Error checking existing reviews:", err);
    }
  };

  useEffect(() => {
    if (!studentId) {
      window.location.href = "/sign-in";
      return;
    }
    fetchBookedSessions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  const getSessionStatus = useCallback((startTime: Date, endTime: Date) => {
    if (currentTime >= startTime && currentTime <= endTime) return "Live";
    return currentTime > endTime ? "Completed" : "Upcoming";
  }, [currentTime]);

  const getCountdown = (startTime: Date) => {
    const diffInMs = startTime.getTime() - currentTime.getTime();
    if (diffInMs <= 0 || diffInMs > 18 * 60 * 60 * 1000) return null; 
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getRelativeTime = (date: Date) => {
    const diffInHours = Math.ceil((date.getTime() - currentTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24 && diffInHours > 0) return `in ${diffInHours}h`;
    if (diffInHours <= 0) return "completed";
    
    const diffInDays = Math.ceil(diffInHours / 24);
    if (diffInDays === 1) return "tomorrow";
    if (diffInDays <= 7) return `in ${diffInDays}d`;
    
    return formatDate(date);
  };

  const handleReviewSubmit = async (session: BookedSession) => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please provide feedback text");
      return;
    }

    try {
      const endpoint = session.session_type === "1:1"
        ? `api/student/review/one-on-one/${session.booking_id}`
        : `api/student/review/group/${session.booking_id}`;
      
      const req: ApiRequestType = {
        endpoint,
        method: "POST",
        auth: true,
        body: {
          rating,
          review_text: reviewText
        }
      };

      const res = await apiRequest(req);
      
      if (!res.success) {
        throw new Error(res.message || "Failed to submit review");
      }

      setReviewedSessions(prev => new Set([...prev, session.booking_id]));
      setReviewingSession(null);
      setRating(0);
      setReviewText('');
      toast.success("Review submitted successfully!");
      await checkExistingReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (selectedFilter !== 'all') {
      const status = getSessionStatus(session.start, session.end);
      if (selectedFilter === 'one_on_one') {
        return session.session_type === '1:1' && status !== 'Completed';
      } else if (selectedFilter === 'group') {
        return session.session_type === 'group' && status !== 'Completed';
      } else if (selectedFilter === 'one_on_one_completed') {
        return session.session_type === '1:1' && status === 'Completed';
      } else if (selectedFilter === 'group_completed') {
        return session.session_type === 'group' && status === 'Completed';
      }
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        session.session_info.title.toLowerCase().includes(query) ||
        session.mentor.name.toLowerCase().includes(query) ||
        session.mentor.username.toLowerCase().includes(query) ||
        session.mentor.email.toLowerCase().includes(query) ||
        (session.meeting_details?.medium?.toLowerCase().includes(query) || false)
      );
    }
    
    return true;
  });

  const isSubmitEnabled = rating >= 1 && rating <= 5 && reviewText.trim().length > 0;

  if (!studentId) {
    return null; 
  }

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
            <h3 className="text-white font-semibold mb-2">Loading Sessions</h3>
            <p className="text-slate-400 text-sm">Fetching your booked sessions...</p>
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
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Error Loading Sessions</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchBookedSessions}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const oneOnOneCount = sessions.filter(s => s.session_type === '1:1').length;
  const groupCount = sessions.filter(s => s.session_type === 'group').length;
  const oneOnOneCompletedCount = sessions.filter(s => s.session_type === '1:1' && getSessionStatus(s.start, s.end) === 'Completed').length;
  const groupCompletedCount = sessions.filter(s => s.session_type === 'group' && getSessionStatus(s.start, s.end) === 'Completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ScrollArea className="h-screen">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"
              >
                <GraduationCap className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
                >
                  My Booked Sessions
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-sm"
                >
                  View and manage your booked learning sessions
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 flex-wrap gap-4">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05, y: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 to-orange-900/20 border border-amber-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
              >
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <div className="relative z-10 flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{sessions.length}</div>
                    <div className="text-xs text-amber-300 font-medium">Total</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-950/40 to-cyan-900/20 border border-blue-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
              >
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <div className="relative z-10 flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{groupCount}</div>
                    <div className="text-xs text-blue-300 font-medium">Group</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-950/40 to-violet-900/20 border border-purple-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
              >
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <div className="relative z-10 flex items-center space-x-3">
                  <User className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{oneOnOneCount}</div>
                    <div className="text-xs text-purple-300 font-medium">1:1</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-green-900/20 border border-emerald-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
              >
                <motion.div
                  variants={shimmerVariants}
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <div className="relative z-10 flex items-center space-x-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{oneOnOneCompletedCount + groupCompletedCount}</div>
                    <div className="text-xs text-emerald-300 font-medium">Completed</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-1 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-1"
              >
                {(['all', 'one_on_one', 'group', 'one_on_one_completed', 'group_completed'] as const).map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFilter(filter)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
                      selectedFilter === filter
                        ? 'bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                    }`}
                  >
                    {selectedFilter === filter && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-purple-600/60 rounded-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>
                        {filter === 'one_on_one' ? '1:1' : 
                         filter === 'one_on_one_completed' ? '1:1 Completed' : 
                         filter === 'group_completed' ? 'Group Completed' : 
                         filter}
                      </span>
                      {filter !== 'all' && (
                        <span className="bg-slate-900/60 px-2 py-0.5 rounded text-xs">
                          {filter === 'one_on_one' ? oneOnOneCount : 
                           filter === 'group' ? groupCount : 
                           filter === 'one_on_one_completed' ? oneOnOneCompletedCount : 
                           groupCompletedCount}
                        </span>
                      )}
                    </span>
                  </motion.button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredSessions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <CalendarDays className="w-10 h-10 text-slate-400" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-3"
                >
                  {selectedFilter === 'all' ? 'No sessions booked' : 
                   selectedFilter === 'one_on_one' ? 'No 1:1 sessions' : 
                   selectedFilter === 'group' ? 'No group sessions' : 
                   selectedFilter === 'one_on_one_completed' ? 'No completed 1:1 sessions' : 
                   'No completed group sessions'}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400"
                >
                  {selectedFilter === 'all' 
                    ? 'Your booked sessions will appear here once you book them'
                    : `You have no ${selectedFilter.replace('_', ' ')} sessions at the moment`
                  }
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredSessions
                  .sort((a, b) => {
                    const statusA = getSessionStatus(a.start, a.end);
                    const statusB = getSessionStatus(b.start, b.end);
                    if (statusA === 'Completed' && statusB !== 'Completed') return 1;
                    if (statusA !== 'Completed' && statusB === 'Completed') return -1;
                    return a.start.getTime() - b.start.getTime();
                  })
                  .map((session) => {
                    const status = getSessionStatus(session.start, session.end);
                    const isCompleted = status === "Completed";
                    const isLive = status === "Live";
                    const countdown = getCountdown(session.start);
                    const relativeTime = getRelativeTime(session.start);
                    const isOnline = session.meeting_details?.medium === "online";
                    const isGroup = session.session_type === "group";
                    const meetingLink = isGroup
                      ? session.session_info.platform
                        ? (session.session_info.platform.includes('meet.google.com') || session.session_info.platform.includes('zoom.us')
                          ? session.session_info.platform
                          : `https://meet.google.com/${session.session_info.platform}`)
                        : null
                      : isOnline
                        ? session.meeting_details?.online_link
                          ? (session.meeting_details.online_link.includes('meet.google.com') || session.meeting_details.online_link.includes('zoom.us')
                            ? session.meeting_details.online_link
                            : `https://meet.google.com/${session.meeting_details.online_link}`)
                          : null
                        : session.meeting_details?.online_link
                          ? `https://maps.google.com/?q=${encodeURIComponent(session.meeting_details.online_link)}`
                          : null;
                    const hasLink = !!meetingLink;
                    const hasReviewed = reviewedSessions.has(session.booking_id);

                    return (
                      <motion.div
                        key={session.booking_id}
                        variants={sessionCardVariants}
                        whileHover="hover"
                        className={`group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-5 cursor-pointer transition-all duration-500 overflow-hidden ${
                          isCompleted ? 'opacity-70' : ''
                        }`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          initial={false}
                        />

                        <div className="relative z-10 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative"
                              >
                                <img
                                  src={getAvatar(session.mentor.username)}
                                  alt={session.mentor.name}
                                  className="w-10 h-10 rounded-xl border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300 object-cover"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                                  isCompleted ? 'bg-emerald-500' : isLive ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                                }`} />
                              </motion.div>
                              <div>
                                <h3 className="font-bold text-white text-sm mb-1 group-hover:text-amber-200 transition-colors duration-300">
                                  {session.session_info.title}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center space-x-1 ${
                                    isGroup
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                      : isOnline
                                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  }`}>
                                    {isGroup ? 
                                      <Users className="w-3 h-3" /> :
                                      isOnline ? 
                                        <Video className="w-3 h-3" /> : 
                                        <MapPin className="w-3 h-3" />
                                    }
                                    <span>{isGroup ? 'Group' : session.meeting_details?.medium}</span>
                                  </span>
                                  {!isCompleted && (
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                      isLive
                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}>
                                      {isLive ? 'LIVE' : countdown || 'Upcoming'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                                isCompleted 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                  : isLive
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {isLive ? 'Now' : relativeTime}
                            </motion.div>
                          </div>

                          <div className="pb-3 border-b border-slate-700/30">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <div className="text-white font-semibold text-sm">{session.mentor.name}</div>
                            </div>
                            <div className="text-slate-400 text-xs">@{session.mentor.username}</div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <div className="text-slate-400 text-xs">{session.mentor.email}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 text-xs">Duration</span>
                              </div>
                              <span className="text-white font-bold text-sm">{session.session_info.duration}min</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 text-xs">Time</span>
                              </div>
                              <span className="text-white font-bold text-xs">
                                {formatTime(session.start)} - {formatTime(session.end)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <CalendarDays className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 text-xs">Date</span>
                              </div>
                              <span className="text-white font-bold text-xs">{formatDate(session.start)}</span>
                            </div>
                            {!isGroup && session.payment_info && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-3 h-3 text-slate-400" />
                                  <span className="text-slate-400 text-xs">Price</span>
                                </div>
                                <span className="text-white font-bold text-xs">{session.payment_info.amount} UCOIN</span>
                              </div>
                            )}
                            {isGroup && session.session_info.max_participants && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-3 h-3 text-slate-400" />
                                  <span className="text-slate-400 text-xs">Max Participants</span>
                                </div>
                                <span className="text-white font-bold text-xs">{session.session_info.max_participants}</span>
                              </div>
                            )}
                          </div>

                          {!isGroup && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {isOnline ? (
                                    <LinkIcon className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <MapPin className="w-3 h-3 text-emerald-400" />
                                  )}
                                  <span className="text-slate-400 text-xs">
                                    {isOnline ? "Meeting Link" : "Meeting Address"}
                                  </span>
                                </div>
                              </div>
                              {hasLink ? (
                                <motion.a
                                  whileHover={{ scale: 1.01 }}
                                  href={meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block truncate text-sm font-medium px-3 py-2 rounded-lg ${
                                    isOnline
                                      ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                                      : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="truncate">{session.meeting_details!.online_link}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </div>
                                </motion.a>
                              ) : (
                                <div className={`text-sm px-3 py-2 rounded-lg ${
                                  isOnline
                                    ? 'bg-blue-500/5 text-blue-400 border border-dashed border-blue-500/30'
                                    : 'bg-emerald-500/5 text-emerald-400 border border-dashed border-emerald-500/30'
                                }`}>
                                  {isOnline ? "No meeting link added yet" : "No address specified"}
                                </div>
                              )}
                            </div>
                          )}

                          {isGroup && session.session_info.description && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="w-3 h-3 text-slate-400" />
                                  <span className="text-slate-400 text-xs">Description</span>
                                </div>
                              </div>
                              <div className="text-sm text-slate-400 px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-600/30 line-clamp-2 hover:line-clamp-none transition-all duration-300">
                                {session.session_info.description}
                              </div>
                            </div>
                          )}

                          <motion.div
                            whileHover={isCompleted && !hasReviewed ? { scale: 1.02 } : {}}
                            whileTap={isCompleted && !hasReviewed ? { scale: 0.98 } : {}}
                            className={`block w-full text-center px-4 py-2 rounded-lg font-medium text-sm ${
                              isCompleted
                                ? hasReviewed
                                  ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
                                : hasLink
                                  ? isGroup
                                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white'
                                    : isOnline
                                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
                                  : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (isCompleted && !hasReviewed) {
                                setReviewingSession(session.booking_id);
                              }
                            }}
                          >
                            {isCompleted ? (
                              hasReviewed ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <span>Reviewed</span>
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-2">
                                  <span>Leave a Review</span>
                                  <Star className="w-4 h-4" />
                                </div>
                              )
                            ) : (
                              <a
                                href={hasLink ? meetingLink : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2"
                              >
                                <span>{isGroup ? "Join Session" : isOnline ? "Join Meeting" : "View Location"}</span>
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {reviewingSession && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  variants={dialogVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-slate-800/90 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Rate this session</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setReviewingSession(null);
                        setRating(0);
                        setReviewText('');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your feedback (required)"
                      className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <AnimatePresence>
                        {isSubmitEnabled && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleReviewSubmit(sessions.find(s => s.booking_id === reviewingSession)!)}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm"
                          >
                            Submit Review
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setReviewingSession(null);
                          setRating(0);
                          setReviewText('');
                        }}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-4 py-2 rounded-lg font-medium text-sm"
                      >
                        Cancel
                      </motion.button>
                    </div>
                    {!isSubmitEnabled && (
                      <p className="text-xs text-slate-400 text-center">
                        Please provide both a rating and feedback to submit your review
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}