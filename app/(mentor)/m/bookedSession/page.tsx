"use client"
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Video, 
  MapPin, 
  Edit3, 
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
  DollarSign
} from "lucide-react";

// Avatar utility function
export function getAvatar(username: string): string {
  return `https://robohash.org/${username}.png?size=200x200`;
}

// Interface for booked session data
interface BookedSessionTableData {
  one_on_one_session_id: string;
  session_info: {
    id: string;
    title: string;
    description: string;
    type: string;
    duration: number;
    price: number;
    is_online: boolean;
    is_offline: boolean;
    created_at: string;
  };
  time_slot: {
    start: string;
    end: string;
    status: string;
    booked_at: string;
  };
  meeting_details: {
    medium: "online" | "offline";
    online_link: string | null;
  };
  student: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    username: string;
    image_url: string | null;
  };
  payment_status: "Pending" | "Completed" | "Refunded" | null;
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

export default function BookedSessionsPage() {
  const [sessions, setSessions] = useState<BookedSessionTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState('');
  const [savingLink, setSavingLink] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch booked sessions
  const fetchBookedSessions = async () => {
    try {
      const req: ApiRequestType = {
        endpoint: "api/sessions/booked/m/all",
        method: "GET",
        auth: true,
      };
      const res = await apiRequest(req);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch booked sessions");
      }
      setSessions(res.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching sessions");
      setLoading(false);
    }
  };

  // Update session link
  const updateSessionLink = async (sessionId: string, link: string) => {
    setSavingLink(true);
    try {
      const req: ApiRequestType = {
        endpoint: `api/sessions/booked/link-or-address/${sessionId}`,
        method: "PUT",
        auth: true,
        body: { link }
      };
      const res = await apiRequest(req);
      if (!res.success) {
        throw new Error(res.message || "Failed to update meeting link");
      }
      
      // Update sessions state
      setSessions(prev => prev.map(session => 
        session.one_on_one_session_id === sessionId
          ? {
              ...session,
              meeting_details: {
                ...session.meeting_details,
                online_link: link
              }
            }
          : session
      ));
      
      setEditingSession(null);
      setEditingLink('');
      toast.success("Meeting details updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update meeting details");
    } finally {
      setSavingLink(false);
    }
  };

  useEffect(() => {
    fetchBookedSessions();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  const getSessionStatus = useCallback((startTime: string, endTime: string) => {
    const now = currentTime;
    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(endTime);
    if (now >= sessionStart && now <= sessionEnd) return "Live";
    return sessionEnd < now ? "Completed" : "Upcoming";
  }, [currentTime]);

  const getCountdown = (startTime: string) => {
    const diffInMs = new Date(startTime).getTime() - currentTime.getTime();
    if (diffInMs <= 0 || diffInMs > 18 * 60 * 60 * 1000) return null; 
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = currentTime;
    const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24 && diffInHours > 0) return `in ${diffInHours}h`;
    if (diffInHours <= 0) return "completed";
    
    const diffInDays = Math.ceil(diffInHours / 24);
    if (diffInDays === 1) return "tomorrow";
    if (diffInDays <= 7) return `in ${diffInDays}d`;
    
    return formatDate(dateString);
  };

  const startEditing = (session: BookedSessionTableData) => {
    setEditingSession(session.one_on_one_session_id);
    setEditingLink(session.meeting_details.online_link || '');
  };

  const cancelEditing = () => {
    setEditingSession(null);
    setEditingLink('');
  };

  const filteredSessions = sessions.filter(session => {
    // Filter by status
    if (selectedFilter !== 'all') {
      const status = getSessionStatus(session.time_slot.start, session.time_slot.end);
      const statusMatch = selectedFilter === 'upcoming' ? status !== 'Completed' : status === 'Completed';
      if (!statusMatch) return false;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        session.session_info.title.toLowerCase().includes(query) ||
        session.student.name.toLowerCase().includes(query) ||
        session.student.username.toLowerCase().includes(query) ||
        session.student.email.toLowerCase().includes(query) ||
        session.meeting_details.medium.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

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

  const upcomingCount = sessions.filter(s => getSessionStatus(s.time_slot.start, s.time_slot.end) !== 'Completed').length;
  const completedCount = sessions.filter(s => getSessionStatus(s.time_slot.start, s.time_slot.end) === 'Completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ScrollArea className="h-screen">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Section */}
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
                  Sessions Dashboard
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-sm"
                >
                  Manage your teaching sessions and student meetings
                </motion.p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex items-center justify-center space-x-4">
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
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{upcomingCount}</div>
                    <div className="text-xs text-blue-300 font-medium">Upcoming</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
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
                    <div className="text-lg font-bold text-white">{completedCount}</div>
                    <div className="text-xs text-emerald-300 font-medium">Done</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Filter Tabs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-1 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-1"
              >
                {(['all', 'upcoming', 'completed'] as const).map((filter) => (
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
                      <span>{filter}</span>
                      {filter !== 'all' && (
                        <span className="bg-slate-900/60 px-2 py-0.5 rounded text-xs">
                          {filter === 'upcoming' ? upcomingCount : completedCount}
                        </span>
                      )}
                    </span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Search */}
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

          {/* Sessions Grid */}
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
                  {selectedFilter === 'all' ? 'No sessions scheduled' : `No ${selectedFilter} sessions`}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400"
                >
                  {selectedFilter === 'all' 
                    ? 'Your booked teaching sessions will appear here once students book with you'
                    : `You have no ${selectedFilter} sessions at the moment`
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
                    const statusA = getSessionStatus(a.time_slot.start, a.time_slot.end);
                    const statusB = getSessionStatus(b.time_slot.start, b.time_slot.end);
                    if (statusA === 'Completed' && statusB !== 'Completed') return 1;
                    if (statusA !== 'Completed' && statusB === 'Completed') return -1;
                    return new Date(a.time_slot.start).getTime() - new Date(b.time_slot.start).getTime();
                  })
                  .map((session) => {
                    const status = getSessionStatus(session.time_slot.start, session.time_slot.end);
                    const isCompleted = status === "Completed";
                    const isLive = status === "Live";
                    const countdown = getCountdown(session.time_slot.start);
                    const relativeTime = getRelativeTime(session.time_slot.start);
                    const isEditing = editingSession === session.one_on_one_session_id;
                    const isOnline = session.meeting_details.medium === "online";
                    const hasLink = session.meeting_details.online_link;
                    
                    return (
                      <motion.div
                        key={session.one_on_one_session_id}
                        variants={sessionCardVariants}
                        whileHover="hover"
                        className={`group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-5 cursor-pointer transition-all duration-500 overflow-hidden ${
                          isCompleted ? 'opacity-70' : ''
                        }`}
                      >
                        {/* Gradient overlay on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          initial={false}
                        />

                        {/* Card Content */}
                        <div className="relative z-10 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative"
                              >
                                <img
                                  src={getAvatar(session.student.username)}
                                  alt={session.student.name}
                                  className="w-10 h-10 rounded-xl border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300"
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
                                    isOnline
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  }`}>
                                    {isOnline ? 
                                      <Video className="w-3 h-3" /> : 
                                      <MapPin className="w-3 h-3" />
                                    }
                                    <span>{session.meeting_details.medium}</span>
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

                          {/* Student Details */}
                          <div className="pb-3 border-b border-slate-700/30">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <div className="text-white font-semibold text-sm">{session.student.name}</div>
                            </div>
                            <div className="text-slate-400 text-xs">@{session.student.username}</div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-400 text-xs">{session.student.email}</span>
                            </div>
                          </div>

                          {/* Session Meta */}
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
                                {formatTime(session.time_slot.start)} - {formatTime(session.time_slot.end)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <CalendarDays className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 text-xs">Date</span>
                              </div>
                              <span className="text-white font-bold text-xs">{formatDate(session.time_slot.start)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 text-xs">Price</span>
                              </div>
                              <span className="text-white font-bold text-xs">{session.session_info.price} UCOIN</span>
                            </div>
                          </div>

                          {/* Meeting Link Section */}
                          <div className="space-y-2">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingLink}
                                  onChange={(e) => setEditingLink(e.target.value)}
                                  placeholder={
                                    isOnline
                                      ? "Enter meeting link (e.g., https://meet.google.com/abc-xyz)"
                                      : "Enter meeting address"
                                  }
                                  className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateSessionLink(session.one_on_one_session_id, editingLink)}
                                    disabled={savingLink}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                                  >
                                    {savingLink ? (
                                      <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4" />
                                        <span>Save</span>
                                      </>
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={cancelEditing}
                                    className="bg-slate-700/50 hover:bg-slate-700/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
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
                                  {!isCompleted && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => startEditing(session)}
                                      className="text-xs bg-slate-700/50 hover:bg-slate-700/70 text-white px-2 py-1 rounded-lg flex items-center space-x-1"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Edit</span>
                                    </motion.button>
                                  )}
                                </div>
                                {hasLink ? (
                                  <motion.a
                                    whileHover={{ scale: 1.01 }}
                                    href={isOnline ? session.meeting_details.online_link! : `https://maps.google.com/?q=${encodeURIComponent(session.meeting_details.online_link!)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block truncate text-sm font-medium px-3 py-2 rounded-lg ${
                                      isOnline
                                        ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                                        : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="truncate">{session.meeting_details.online_link}</span>
                                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </div>
                                  </motion.a>
                                ) : (
                                  <div className={`text-sm px-3 py-2 rounded-lg ${
                                    isOnline
                                      ? 'bg-blue-500/5 text-blue-400 border border-dashed border-blue-500/30'
                                      : 'bg-emerald-500/5 text-emerald-400 border border-dashed border-emerald-500/30'
                                  }`}>
                                    {isOnline ? "No meeting link added" : "No address specified"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Join/View Button */}
                          {!isEditing && (
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              href={hasLink ? 
                                (isOnline 
                                  ? session.meeting_details.online_link! 
                                  : `https://maps.google.com/?q=${encodeURIComponent(session.meeting_details.online_link!)}`
                                ) : "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block w-full text-center px-4 py-2 rounded-lg font-medium text-sm ${
                                hasLink
                                  ? isOnline
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
                                  : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <span>{isOnline ? "Join Meeting" : "View Location"}</span>
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </motion.a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}


// "use client"
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { toast } from "sonner";
// import { 
//   Calendar, 
//   Clock, 
//   Users, 
//   Search, 
//   Video, 
//   MapPin, 
//   Edit3, 
//   Check, 
//   X, 
//   ExternalLink,
//   CalendarDays,
//   BookOpen,
//   User,
//   GraduationCap,
//   AlertCircle,
//   Link as LinkIcon,
//   Home,
//   ArrowRight,
//   Mail,
//   DollarSign
// } from "lucide-react";

// // Avatar utility function
// export function getAvatar(username: string): string {
//   return `https://robohash.org/${username}.png?size=200x200`;
// }

// // Interface for booked session data
// interface BookedSessionTableData {
//   one_on_one_session_id: string;
//   session_info: {
//     id: string;
//     title: string;
//     description: string;
//     type: string;
//     duration: number;
//     price: number;
//     is_online: boolean;
//     is_offline: boolean;
//     created_at: string;
//   };
//   time_slot: {
//     start: string;
//     end: string;
//     status: string;
//     booked_at: string;
//   };
//   meeting_details: {
//     medium: "online" | "offline";
//     online_link: string | null;
//   };
//   student: {
//     id: string;
//     user_id: string;
//     name: string;
//     email: string;
//     username: string;
//     image_url: string | null;
//   };
//   payment_status: "Pending" | "Completed" | "Refunded" | null;
// }

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.05,
//       delayChildren: 0.1
//     }
//   }
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 30, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       type: "spring",
//       stiffness: 100,
//       damping: 25,
//       mass: 1
//     }
//   }
// };

// const sessionCardVariants = {
//   hidden: { opacity: 0, scale: 0.9, y: 20 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     y: 0,
//     transition: {
//       type: "spring",
//       stiffness: 120,
//       damping: 20
//     }
//   },
//   hover: {
//     y: -4,
//     scale: 1.01,
//     transition: {
//       type: "spring",
//       stiffness: 400,
//       damping: 25
//     }
//   }
// };

// const shimmerVariants = {
//   animate: {
//     backgroundPosition: ["200% 0", "-200% 0"],
//     transition: {
//       duration: 2,
//       ease: "linear",
//       repeat: Infinity,
//     }
//   }
// };

// export default function BookedSessionsPage() {
//   const [sessions, setSessions] = useState<BookedSessionTableData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [editingSession, setEditingSession] = useState<string | null>(null);
//   const [editingLink, setEditingLink] = useState('');
//   const [savingLink, setSavingLink] = useState(false);

//   // Fetch booked sessions
//   const fetchBookedSessions = async () => {
//     try {
//       const req: ApiRequestType = {
//         endpoint: "api/sessions/booked/m/all",
//         method: "GET",
//         auth: true,
//       };
//       const res = await apiRequest(req);
//       if (!res.success) {
//         throw new Error(res.message || "Failed to fetch booked sessions");
//       }
//       setSessions(res.data);
//       setLoading(false);
//     } catch (err: any) {
//       setError(err.message || "An error occurred while fetching sessions");
//       setLoading(false);
//     }
//   };

//   // Update session link
//   const updateSessionLink = async (sessionId: string, link: string) => {
//     setSavingLink(true);
//     try {
//       const req: ApiRequestType = {
//         endpoint: `api/sessions/booked/link-or-address/${sessionId}`,
//         method: "PUT",
//         auth: true,
//         body: { link }
//       };
//       const res = await apiRequest(req);
//       if (!res.success) {
//         throw new Error(res.message || "Failed to update meeting link");
//       }
      
//       // Update sessions state
//       setSessions(prev => prev.map(session => 
//         session.one_on_one_session_id === sessionId
//           ? {
//               ...session,
//               meeting_details: {
//                 ...session.meeting_details,
//                 online_link: link
//               }
//             }
//           : session
//       ));
      
//       setEditingSession(null);
//       setEditingLink('');
//       toast.success("Meeting details updated successfully");
//     } catch (err: any) {
//       toast.error(err.message || "Failed to update meeting details");
//     } finally {
//       setSavingLink(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookedSessions();
//   }, []);

//   const getSessionStatus = (endTime: string) => {
//     const now = new Date();
//     const sessionEnd = new Date(endTime);
//     return sessionEnd < now ? "Completed" : "Upcoming";
//   };

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric"
//     });
//   };

//   const getRelativeTime = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
//     if (diffInHours < 24 && diffInHours > 0) return `in ${diffInHours}h`;
//     if (diffInHours <= 0) return "completed";
    
//     const diffInDays = Math.ceil(diffInHours / 24);
//     if (diffInDays === 1) return "tomorrow";
//     if (diffInDays <= 7) return `in ${diffInDays}d`;
    
//     return formatDate(dateString);
//   };

//   const startEditing = (session: BookedSessionTableData) => {
//     setEditingSession(session.one_on_one_session_id);
//     setEditingLink(session.meeting_details.online_link || '');
//   };

//   const cancelEditing = () => {
//     setEditingSession(null);
//     setEditingLink('');
//   };

//   const filteredSessions = sessions.filter(session => {
//     // Filter by status
//     if (selectedFilter !== 'all') {
//       const status = getSessionStatus(session.time_slot.end);
//       const statusMatch = selectedFilter === 'upcoming' ? status === 'Upcoming' : status === 'Completed';
//       if (!statusMatch) return false;
//     }
    
//     // Filter by search query
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       return (
//         session.session_info.title.toLowerCase().includes(query) ||
//         session.student.name.toLowerCase().includes(query) ||
//         session.student.username.toLowerCase().includes(query) ||
//         session.student.email.toLowerCase().includes(query) ||
//         session.meeting_details.medium.toLowerCase().includes(query)
//       );
//     }
    
//     return true;
//   });

//   if (loading) {
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
//                 scale: [1, 1.1, 1]
//               }}
//               transition={{ 
//                 rotate: { duration: 2, repeat: Infinity, ease: "linear" },
//                 scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
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
//             <h3 className="text-white font-semibold mb-2">Loading Sessions</h3>
//             <p className="text-slate-400 text-sm">Fetching your booked sessions...</p>
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
//               <AlertCircle className="w-6 h-6 text-red-400" />
//             </div>
//             <div>
//               <h3 className="text-white font-semibold mb-1">Error Loading Sessions</h3>
//               <p className="text-slate-400 text-sm">{error}</p>
//             </div>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={fetchBookedSessions}
//             className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
//           >
//             Try Again
//           </motion.button>
//         </motion.div>
//       </div>
//     );
//   }

//   const upcomingCount = sessions.filter(s => getSessionStatus(s.time_slot.end) === 'Upcoming').length;
//   const completedCount = sessions.filter(s => getSessionStatus(s.time_slot.end) === 'Completed').length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
//       <ScrollArea className="h-screen">
//         <div className="max-w-7xl mx-auto p-6 space-y-8">
//           {/* Header Section */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center space-y-6"
//           >
//             <div className="flex items-center justify-center space-x-3 mb-4">
//               <motion.div
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"
//               >
//                 <GraduationCap className="w-7 h-7 text-white" />
//               </motion.div>
//               <div>
//                 <motion.h1 
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
//                 >
//                   Sessions Dashboard
//                 </motion.h1>
//                 <motion.p 
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.1 }}
//                   className="text-slate-400 text-sm"
//                 >
//                   Manage your teaching sessions and student meetings
//                 </motion.p>
//               </div>
//             </div>
            
//             {/* Stats Cards */}
//             <div className="flex items-center justify-center space-x-4">
//               <motion.div
//                 variants={cardVariants}
//                 initial="hidden"
//                 animate="visible"
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 to-orange-900/20 border border-amber-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
//               >
//                 <motion.div
//                   variants={shimmerVariants}
//                   animate="animate"
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
//                   style={{ backgroundSize: "200% 100%" }}
//                 />
//                 <div className="relative z-10 flex items-center space-x-3">
//                   <BookOpen className="w-5 h-5 text-amber-400" />
//                   <div>
//                     <div className="text-lg font-bold text-white">{sessions.length}</div>
//                     <div className="text-xs text-amber-300 font-medium">Total</div>
//                   </div>
//                 </div>
//               </motion.div>
              
//               <motion.div
//                 variants={cardVariants}
//                 initial="hidden"
//                 animate="visible"
//                 transition={{ delay: 0.1 }}
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 className="relative overflow-hidden bg-gradient-to-br from-blue-950/40 to-cyan-900/20 border border-blue-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
//               >
//                 <motion.div
//                   variants={shimmerVariants}
//                   animate="animate"
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
//                   style={{ backgroundSize: "200% 100%" }}
//                 />
//                 <div className="relative z-10 flex items-center space-x-3">
//                   <Clock className="w-5 h-5 text-blue-400" />
//                   <div>
//                     <div className="text-lg font-bold text-white">{upcomingCount}</div>
//                     <div className="text-xs text-blue-300 font-medium">Upcoming</div>
//                   </div>
//                 </div>
//               </motion.div>
              
//               <motion.div
//                 variants={cardVariants}
//                 initial="hidden"
//                 animate="visible"
//                 transition={{ delay: 0.2 }}
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-green-900/20 border border-emerald-800/30 rounded-xl px-4 py-3 backdrop-blur-sm"
//               >
//                 <motion.div
//                   variants={shimmerVariants}
//                   animate="animate"
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
//                   style={{ backgroundSize: "200% 100%" }}
//                 />
//                 <div className="relative z-10 flex items-center space-x-3">
//                   <Check className="w-5 h-5 text-emerald-400" />
//                   <div>
//                     <div className="text-lg font-bold text-white">{completedCount}</div>
//                     <div className="text-xs text-emerald-300 font-medium">Done</div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Search and Filters */}
//             <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
//               {/* Filter Tabs */}
//               <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="flex items-center space-x-1 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-1"
//               >
//                 {(['all', 'upcoming', 'completed'] as const).map((filter) => (
//                   <motion.button
//                     key={filter}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => setSelectedFilter(filter)}
//                     className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
//                       selectedFilter === filter
//                         ? 'bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white shadow-lg shadow-violet-500/20'
//                         : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
//                     }`}
//                   >
//                     {selectedFilter === filter && (
//                       <motion.div
//                         layoutId="activeTab"
//                         className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-purple-600/60 rounded-lg"
//                         transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                       />
//                     )}
//                     <span className="relative z-10 flex items-center space-x-2">
//                       <span>{filter}</span>
//                       {filter !== 'all' && (
//                         <span className="bg-slate-900/60 px-2 py-0.5 rounded text-xs">
//                           {filter === 'upcoming' ? upcomingCount : completedCount}
//                         </span>
//                       )}
//                     </span>
//                   </motion.button>
//                 ))}
//               </motion.div>

//               {/* Search */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 }}
//                 className="relative"
//               >
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Search sessions..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-64 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
//                   />
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
//                   {searchQuery && (
//                     <motion.button
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       onClick={() => setSearchQuery('')}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-white transition-colors"
//                     >
//                       <X className="w-4 h-4" />
//                     </motion.button>
//                   )}
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Sessions Grid */}
//           <AnimatePresence mode="wait">
//             {filteredSessions.length === 0 ? (
//               <motion.div
//                 key="empty"
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-16 text-center"
//               >
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
//                   className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
//                 >
//                   <CalendarDays className="w-10 h-10 text-slate-400" />
//                 </motion.div>
//                 <motion.h3 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="text-xl font-bold text-white mb-3"
//                 >
//                   {selectedFilter === 'all' ? 'No sessions scheduled' : `No ${selectedFilter} sessions`}
//                 </motion.h3>
//                 <motion.p 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.4 }}
//                   className="text-slate-400"
//                 >
//                   {selectedFilter === 'all' 
//                     ? 'Your booked teaching sessions will appear here once students book with you'
//                     : `You have no ${selectedFilter} sessions at the moment`
//                   }
//                 </motion.p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="grid"
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//               >
//                 {filteredSessions
//                   .sort((a, b) => new Date(a.time_slot.start).getTime() - new Date(b.time_slot.start).getTime())
//                   .map((session) => {
//                     const status = getSessionStatus(session.time_slot.end);
//                     const isCompleted = status === "Completed";
//                     const relativeTime = getRelativeTime(session.time_slot.start);
//                     const isEditing = editingSession === session.one_on_one_session_id;
//                     const isOnline = session.meeting_details.medium === "online";
//                     const hasLink = session.meeting_details.online_link;
                    
//                     return (
//                       <motion.div
//                         key={session.one_on_one_session_id}
//                         variants={sessionCardVariants}
//                         whileHover="hover"
//                         className={`group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-5 cursor-pointer transition-all duration-500 overflow-hidden ${
//                           isCompleted ? 'opacity-70' : ''
//                         }`}
//                       >
//                         {/* Gradient overlay on hover */}
//                         <motion.div
//                           className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//                           initial={false}
//                         />

//                         {/* Card Content */}
//                         <div className="relative z-10 space-y-4">
//                           {/* Header */}
//                           <div className="flex items-start justify-between">
//                             <div className="flex items-center space-x-3">
//                               <motion.div
//                                 whileHover={{ scale: 1.1, rotate: 5 }}
//                                 className="relative"
//                               >
//                                 <img
//                                   src={getAvatar(session.student.username)}
//                                   alt={session.student.name}
//                                   className="w-10 h-10 rounded-xl border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300"
//                                 />
//                                 <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
//                                   isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
//                                 }`} />
//                               </motion.div>
//                               <div>
//                                 <h3 className="font-bold text-white text-sm mb-1 group-hover:text-amber-200 transition-colors duration-300">
//                                   {session.session_info.title}
//                                 </h3>
//                                 <div className="flex items-center space-x-2">
//                                   <span className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center space-x-1 ${
//                                     isOnline
//                                       ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
//                                       : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
//                                   }`}>
//                                     {isOnline ? 
//                                       <Video className="w-3 h-3" /> : 
//                                       <MapPin className="w-3 h-3" />
//                                     }
//                                     <span>{session.meeting_details.medium}</span>
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
                            
//                             <motion.div
//                               whileHover={{ scale: 1.05 }}
//                               className={`px-2 py-1 rounded-lg text-xs font-bold border ${
//                                 isCompleted 
//                                   ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
//                                   : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
//                               }`}
//                             >
//                               {relativeTime}
//                             </motion.div>
//                           </div>

//                           {/* Student Details */}
//                           <div className="pb-3 border-b border-slate-700/30">
//                             <div className="flex items-center space-x-2 mb-1">
//                               <User className="w-3 h-3 text-slate-400" />
//                               <div className="text-white font-semibold text-sm">{session.student.name}</div>
//                             </div>
//                             <div className="text-slate-400 text-xs">@{session.student.username}</div>
//                             <div className="flex items-center space-x-2">
//                                 <Mail className="w-3 h-3 text-slate-400" />
//                                 <span className="text-slate-400 text-xs">{session.student.email}</span>
//                               </div>
//                           </div>

//                           {/* Session Meta */}
//                           <div className="space-y-2">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-2">
//                                 <Clock className="w-3 h-3 text-slate-400" />
//                                 <span className="text-slate-400 text-xs">Duration</span>
//                               </div>
//                               <span className="text-white font-bold text-sm">{session.session_info.duration}min</span>
//                             </div>
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-2">
//                                 <Calendar className="w-3 h-3 text-slate-400" />
//                                 <span className="text-slate-400 text-xs">Time</span>
//                               </div>
//                               <span className="text-white font-bold text-xs">
//                                 {formatTime(session.time_slot.start)} - {formatTime(session.time_slot.end)}
//                               </span>
//                             </div>
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-2">
//                                 <CalendarDays className="w-3 h-3 text-slate-400" />
//                                 <span className="text-slate-400 text-xs">Date</span>
//                               </div>
//                               <span className="text-white font-bold text-xs">{formatDate(session.time_slot.start)}</span>
//                             </div>
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-2">
//                                 <DollarSign className="w-3 h-3 text-slate-400" />
//                                   <span className="text-slate-400 text-xs">Price</span>
//                               </div>
//                               <span className="text-white font-bold text-xs">{session.session_info.price} UCOIN</span>
//                             </div>
//                           </div>

//                           {/* Meeting Link Section */}
//                           <div className="space-y-2">
//                             {isEditing ? (
//                               <div className="space-y-2">
//                                 <input
//                                   type="text"
//                                   value={editingLink}
//                                   onChange={(e) => setEditingLink(e.target.value)}
//                                   placeholder={
//                                     isOnline
//                                       ? "Enter meeting link (e.g., https://meet.google.com/abc-xyz)"
//                                       : "Enter meeting address"
//                                   }
//                                   className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
//                                 />
//                                 <div className="flex items-center space-x-2">
//                                   <motion.button
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     onClick={() => updateSessionLink(session.one_on_one_session_id, editingLink)}
//                                     disabled={savingLink}
//                                     className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
//                                   >
//                                     {savingLink ? (
//                                       <>
//                                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         <span>Saving...</span>
//                                       </>
//                                     ) : (
//                                       <>
//                                         <Check className="w-4 h-4" />
//                                         <span>Save</span>
//                                       </>
//                                     )}
//                                   </motion.button>
//                                   <motion.button
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     onClick={cancelEditing}
//                                     className="bg-slate-700/50 hover:bg-slate-700/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
//                                   >
//                                     <X className="w-4 h-4" />
//                                     <span>Cancel</span>
//                                   </motion.button>
//                                 </div>
//                               </div>
//                             ) : (
//                               <div className="space-y-2">
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center space-x-2">
//                                     {isOnline ? (
//                                       <LinkIcon className="w-3 h-3 text-blue-400" />
//                                     ) : (
//                                       <MapPin className="w-3 h-3 text-emerald-400" />
//                                     )}
//                                     <span className="text-slate-400 text-xs">
//                                       {isOnline ? "Meeting Link" : "Meeting Address"}
//                                     </span>
//                                   </div>
//                                   {!isCompleted && (
//                                     <motion.button
//                                       whileHover={{ scale: 1.05 }}
//                                       whileTap={{ scale: 0.95 }}
//                                       onClick={() => startEditing(session)}
//                                       className="text-xs bg-slate-700/50 hover:bg-slate-700/70 text-white px-2 py-1 rounded-lg flex items-center space-x-1"
//                                     >
//                                       <Edit3 className="w-3 h-3" />
//                                       <span>Edit</span>
//                                     </motion.button>
//                                   )}
//                                 </div>
//                                 {hasLink ? (
//                                   <motion.a
//                                     whileHover={{ scale: 1.01 }}
//                                     href={isOnline ? session.meeting_details.online_link! : `https://maps.google.com/?q=${encodeURIComponent(session.meeting_details.online_link!)}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className={`block truncate text-sm font-medium px-3 py-2 rounded-lg ${
//                                       isOnline
//                                         ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
//                                         : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
//                                     }`}
//                                   >
//                                     <div className="flex items-center space-x-2">
//                                       <span className="truncate">{session.meeting_details.online_link}</span>
//                                       <ExternalLink className="w-3 h-3 flex-shrink-0" />
//                                     </div>
//                                   </motion.a>
//                                 ) : (
//                                   <div className={`text-sm px-3 py-2 rounded-lg ${
//                                     isOnline
//                                       ? 'bg-blue-500/5 text-blue-400 border border-dashed border-blue-500/30'
//                                       : 'bg-emerald-500/5 text-emerald-400 border border-dashed border-emerald-500/30'
//                                   }`}>
//                                     {isOnline ? "No meeting link added" : "No address specified"}
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           {/* Join/View Button */}
//                           {!isEditing && (
//                             <motion.a
//                               whileHover={{ scale: 1.02 }}
//                               whileTap={{ scale: 0.98 }}
//                               href={hasLink ? 
//                                 (isOnline 
//                                   ? session.meeting_details.online_link! 
//                                   : `https://maps.google.com/?q=${encodeURIComponent(session.meeting_details.online_link!)}`
//                                 ) : "#"
//                               }
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className={`block w-full text-center px-4 py-2 rounded-lg font-medium text-sm ${
//                                 hasLink
//                                   ? isOnline
//                                     ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
//                                     : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
//                                   : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
//                               }`}
//                             >
//                               <div className="flex items-center justify-center space-x-2">
//                                 <span>{isOnline ? "Join Meeting" : "View Location"}</span>
//                                 <ArrowRight className="w-4 h-4" />
//                               </div>
//                             </motion.a>
//                           )}
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }