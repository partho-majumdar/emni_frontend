"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { 
  Star, 
  CalendarDays, 
  Clock, 
  User, 
  Users, 
  Mail, 
  BookOpen,
  GraduationCap,
  Search,
  X,
  ArrowRight,
  Check,
  Video,
} from "lucide-react";

interface Review {
  review_id: string;
  student_id: string;
  mentor_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  username: string;
  user_type: string;
  student_name: string;
  student_email: string;
}

interface Session {
  session_id: string;
  session_type: 'one_on_one' | 'group';
  session_title: string;
  type?: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  description: string;
  medium?: string;
  platform?: string;
  max_participants?: number;
  status?: string;
  created_at?: string;
}

interface SessionWithReviews {
  session: Session;
  reviews: Review[];
}

interface ApiResponse {
  success: boolean;
  data: {
    mentor_id: string;
    average_rating: number;
    sessions: SessionWithReviews[];
  };
}

export function getAvatar(username: string): string {
  return `https://robohash.org/${username}.png?size=200x200`;
}

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
  }
};

export default function ReviewsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'one_on_one' | 'group'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const mentorId = localStorage.getItem('mentor-id');
      if (!mentorId) {
        throw new Error('Mentor ID not found');
      }

      const req: ApiRequestType = {
        endpoint: `api/mentor/reviews/${mentorId}`,
        method: "GET",
        auth: true,
      };

      const res = await apiRequest(req);
      
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch reviews");
      }

      setData(res);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching reviews");
      toast.error(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatDateTime = (dateString: string, isReviewTime: boolean = false) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error(`Invalid date string: ${dateString}`);
      return 'Invalid Date';
    }

    if (isReviewTime) {
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
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error(`Invalid date string: ${dateString}`);
      return 'Invalid Time';
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredSessions = data?.data.sessions.filter(sessionWithReviews => {
    const { session, reviews } = sessionWithReviews;
    
    // Filter by session type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'one_on_one' && session.session_type !== 'one_on_one') {
        return false;
      }
      if (selectedFilter === 'group' && session.session_type !== 'group') {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSession = (
        session.session_title.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query) ||
        (session.medium && session.medium.toLowerCase().includes(query))
      );
      
      const matchesReview = reviews.some(review => 
        review.student_name.toLowerCase().includes(query) ||
        review.username.toLowerCase().includes(query) ||
        review.review_text.toLowerCase().includes(query)
      );
      
      return matchesSession || matchesReview;
    }
    
    return true;
  }) || [];

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
            <h3 className="text-white font-semibold mb-2">Loading Reviews</h3>
            <p className="text-slate-400 text-sm">Fetching your session reviews...</p>
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
              <X className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Error Loading Reviews</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchReviews}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const oneOnOneCount = data?.data.sessions.filter(s => s.session.session_type === 'one_on_one').length || 0;
  const groupCount = data?.data.sessions.filter(s => s.session.session_type === 'group').length || 0;

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
                  Session Reviews
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-sm"
                >
                  Feedback from your mentoring sessions
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
                  <Star className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{data?.data.average_rating.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-amber-300 font-medium">Avg Rating</div>
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
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-1 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-1"
              >
                {(['all', 'one_on_one', 'group'] as const).map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFilter(filter)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
                      selectedFilter === filter
                        ? 'bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white'
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
                        {filter === 'one_on_one' ? '1:1' : filter}
                      </span>
                      {filter !== 'all' && (
                        <span className="bg-slate-900/60 px-2 py-0.5 rounded text-xs">
                          {filter === 'one_on_one' ? oneOnOneCount : groupCount}
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
                    placeholder="Search reviews..."
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
                  <BookOpen className="w-10 h-10 text-slate-400" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-3"
                >
                  {selectedFilter === 'all' ? 'No reviews yet' : 
                   selectedFilter === 'one_on_one' ? 'No 1:1 session reviews' : 
                   'No group session reviews'}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400"
                >
                  {selectedFilter === 'all' 
                    ? 'Reviews from your sessions will appear here'
                    : `You have no ${selectedFilter.replace('_', ' ')} session reviews yet`
                  }
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
              >
                {filteredSessions.map(({ session, reviews }) => (
                  <motion.div
                    key={session.session_id}
                    variants={sessionCardVariants}
                    className={`relative bg-slate-800/30 backdrop-blur-xl border ${
                      session.session_type === 'one_on_one' 
                        ? 'border-purple-700/30 hover:border-purple-500/50' 
                        : 'border-blue-700/30 hover:border-blue-500/50'
                    } rounded-2xl p-5 transition-all duration-300 overflow-hidden`}
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-xl border-2 ${
                              session.session_type === 'one_on_one' 
                                ? 'border-purple-600/50'
                                : 'border-blue-600/50'
                            } flex items-center justify-center`}
                            >
                              {session.session_type === 'one_on_one' ? (
                                <User className="w-5 h-5 text-purple-400" />
                              ) : (
                                <Users className="w-5 h-5 text-blue-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm mb-1">
                              {session.session_title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                                session.session_type === 'one_on_one'
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              }`}>
                                {session.session_type === 'one_on_one' ? '1:1' : 'Group'}
                              </span>
                              <span className="px-2 py-1 rounded-lg text-xs font-semibold border bg-slate-700/20 text-slate-300 border-slate-600/30">
                                {session.session_type === 'group' ? 'Online' : session.medium}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400">
                            {formatDateTime(session.start_time)}
                          </span>
                          <span className="text-xs font-medium text-white">
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </span>
                        </div>
                      </div>

                      <div className="pb-3 border-b border-slate-700/30">
                        <p className="text-slate-400 text-sm">
                          {session.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400 text-xs">Duration</span>
                          </div>
                          <span className="text-white font-bold text-sm">{session.duration_mins} min</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white">
                          Reviews ({reviews.length})
                        </h4>
                        
                        {reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map(review => (
                              <div key={review.review_id} className="bg-slate-800/50 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                  <img
                                    src={getAvatar(review.username)}
                                    alt={`${review.student_name}'s avatar`}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <h5 className="text-sm font-semibold text-white">{review.student_name}</h5>
                                    <p className="text-xs text-slate-400">@{review.username}</p>
                                  </div>
                                </div>
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          review.rating >= i + 1
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-slate-400"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-slate-400 ml-2">
                                    {formatDateTime(review.created_at, true)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">
                                  {review.review_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-800/20 rounded-lg p-4 text-center">
                            <p className="text-sm text-slate-400">
                              No reviews for this session yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}