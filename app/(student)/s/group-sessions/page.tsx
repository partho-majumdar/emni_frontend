"use client";
import { getGroupSessionsList, getGroupSessionParticipants } from "@/app/lib/fetchers";
import { GroupSessionInfoType, GroupSessionParticipantInfo } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { isValid, format } from "date-fns";
import { Users, Hourglass, Calendar, Clock, Search, X, BookOpen, AlertCircle, Lock, Check, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CountdownTimer from "@/app/ui/CountdownTimer";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { joinGroupSession, cancelGroupSession } from "@/app/lib/mutations";
import { motion, AnimatePresence } from "framer-motion";

export const minutesToHours = (minutes: number): string => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Invalid duration";
  }
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (remain > 0) {
    return hours === 0 ? `${remain} min` : `${hours}h ${remain}min`;
  }
  return `${hours}h`;
};

const isValidUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidString = (str: string | undefined | null): boolean => {
  return typeof str === "string" && str.trim().length > 0;
};

const validateParticipants = (
  current: number | undefined | null,
  max: number | undefined | null
): { current: number; max: number } => {
  const validCurrent = Number.isFinite(current) && current! >= 0 ? current! : 0;
  const validMax = Number.isFinite(max) && max! > 0 ? max! : 1;
  return { current: Math.min(validCurrent, validMax), max: validMax };
};

// Animation variants
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

const descriptionVariants = {
  collapsed: { height: "auto", opacity: 1 },
  expanded: { height: "auto", opacity: 1 },
};

const GroupSessionPage = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasShownRegistrationError, setHasShownRegistrationError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to update specific session data
  const updateSessionData = (sessionId: string, updatedData: Partial<GroupSessionInfoType>) => {
    setGsInfo(prevInfo => {
      if (!prevInfo) return prevInfo;
      return prevInfo.map(session => 
        session.id === sessionId 
          ? { ...session, ...updatedData }
          : session
      );
    });
  };

  // Get session status
  const getSessionStatus = (startTime: Date, durationInMinutes: number) => {
    const now = new Date();
    const sessionEnd = new Date(startTime.getTime() + durationInMinutes * 60 * 1000);
    return sessionEnd < now ? "Completed" : "Upcoming";
  };

  // Filter sessions based on search query and status
  const filteredSessions = useMemo(() => {
    if (!gsInfo) return [];
    
    let filtered = gsInfo;
    
    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(session => {
        const status = getSessionStatus(session.startTime, session.durationInMinutes);
        return selectedFilter === 'upcoming' ? status === 'Upcoming' : status === 'Completed';
      });
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query) ||
        session.mentor.name.toLowerCase().includes(query)
      );
    }
    
    // Sort sessions: Upcoming first, Completed last
    return filtered.sort((a, b) => {
      const statusA = getSessionStatus(a.startTime, a.durationInMinutes);
      const statusB = getSessionStatus(b.startTime, b.durationInMinutes);
      if (statusA === statusB) {
        return a.startTime.getTime() - b.startTime.getTime();
      }
      return statusA === 'Upcoming' ? -1 : 1;
    });
  }, [gsInfo, searchQuery, selectedFilter]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("student-id");
      setStudentId(id);
    }

    const fn = async () => {
      try {
        const data = await getGroupSessionsList();
        if (!Array.isArray(data)) {
          console.error("Invalid session data received:", data);
          toast.warning("Received invalid session data.");
          setGsInfo([]);
          setError("Invalid session data received");
          setLoading(false);
          return;
        }
        const sanitizedData = data.map((session) => {
          const startTime = session.startTime ? new Date(session.startTime) : new Date();
          const sanitizedSession = {
            ...session,
            id: isValidString(session.id) ? session.id : `invalid-${Math.random()}`,
            title: isValidString(session.title) ? session.title : "Untitled Session",
            description: isValidString(session.description)
              ? session.description
              : "No description provided.",
            startTime,
            durationInMinutes: Number.isFinite(session.durationInMinutes) && session.durationInMinutes > 0
              ? session.durationInMinutes
              : 60,
            mentor: {
              id: isValidString(session.mentor?.id) ? session.mentor.id : `invalid-mentor-${Math.random()}`,
              name: isValidString(session.mentor?.name) ? session.mentor.name : "Unknown Mentor",
              photoLink: isValidUrl(session.mentor?.photoLink) ? session.mentor.photoLink : "/default-avatar.jpg",
            },
            participants: validateParticipants(session.participants?.current, session.participants?.max),
            previewParticipants: Array.isArray(session.previewParticipants)
              ? session.previewParticipants.map((p, idx) => ({
                  id: isValidString(p.id) ? p.id : `invalid-participant-${idx}-${Math.random()}`,
                  name: isValidString(p.name) ? p.name : "Unknown",
                  photoLink: isValidUrl(p.photoLink) ? p.photoLink : "/default-avatar.jpg",
                }))
              : [],
            platform_link: isValidUrl(session.platform_link) ? session.platform_link : "",
          };
          if (!isValid(startTime)) {
            console.warn(`Session "${sanitizedSession.title}" has invalid start time:`, session.startTime);
            toast.warning(`Session "${sanitizedSession.title}" has an invalid start time.`);
          }
          if (!Number.isFinite(session.durationInMinutes) || session.durationInMinutes <= 0) {
            console.warn(`Session "${sanitizedSession.title}" has invalid duration:`, session.durationInMinutes);
          }
          if (session.participants?.current && session.participants?.max && session.participants.current > session.participants.max) {
            console.warn(`Session "${sanitizedSession.title}" has invalid participant count:`, session.participants);
          }
          return sanitizedSession;
        });
        setGsInfo(sanitizedData);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching group sessions:", error.message, error.stack);
        setError("Failed to load group sessions. Please try again later.");
        setGsInfo([]);
        setLoading(false);
      }
    };
    fn();
  }, []);

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
            <p className="text-slate-400 text-sm">Fetching your group sessions...</p>
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
            onClick={() => window.location.reload()}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const upcomingCount = gsInfo?.filter(s => getSessionStatus(s.startTime, s.durationInMinutes) === 'Upcoming').length || 0;
  const completedCount = gsInfo?.filter(s => getSessionStatus(s.startTime, s.durationInMinutes) === 'Completed').length || 0;

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
                <BookOpen className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
                >
                  Join Group Sessions
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-sm"
                >
                  Join interactive learning sessions with mentors
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
                    <div className="text-lg font-bold text-white">{gsInfo?.length || 0}</div>
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
                  <Input
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
                      onClick={clearSearch}
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
                  <Calendar className="w-10 h-10 text-slate-400" />
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
                    ? 'No group sessions available at the moment'
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
                {filteredSessions.map((grpSession) => (
                  <GroupSessionCard
                    key={grpSession.id}
                    GroupSessionDetails={grpSession}
                    ColorTheme={colors[Math.floor(Math.random() * colors.length)]} // Random color for variety
                    studentId={studentId}
                    onSessionUpdate={updateSessionData}
                    hasShownRegistrationError={hasShownRegistrationError}
                    setHasShownRegistrationError={setHasShownRegistrationError}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

type Props = {
  GroupSessionDetails: GroupSessionInfoType;
  ColorTheme: {
    bg: string;
    text: string;
    accent: string;
  };
  studentId: string | null;
  onSessionUpdate: (sessionId: string, updatedData: Partial<GroupSessionInfoType>) => void;
  hasShownRegistrationError: boolean;
  setHasShownRegistrationError: (value: boolean) => void;
};

const GroupSessionCard = ({ 
  GroupSessionDetails, 
  ColorTheme, 
  studentId, 
  onSessionUpdate,
  hasShownRegistrationError,
  setHasShownRegistrationError
}: Props) => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [participants, setParticipants] = useState<{ current: number; max: number }>(
    GroupSessionDetails.participants
  );
  const [previewParticipants, setPreviewParticipants] = useState(GroupSessionDetails.previewParticipants);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<{ [key: string]: boolean }>({});
  
  // Check if session is completed
  const isCompleted = GroupSessionDetails.startTime < new Date();

  // Safe description handling
  const safeValue = (value: string | undefined | null, fallback: string = "No description provided"): string => {
    return isValidString(value) ? (value as string) : fallback;
  };

  const description = safeValue(GroupSessionDetails.description);
  const cardKey = GroupSessionDetails.id || `card-${Math.random()}`;
  const isThisCardExpanded = isDescriptionExpanded[cardKey] || false;
  const shouldShowExpandButton = description.length > 150;

  const toggleDescription = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDescriptionExpanded((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Function to fetch and update preview participants
  const updatePreviewParticipants = async () => {
    try {
      const participantsData = await getGroupSessionParticipants(GroupSessionDetails.id);
      const registeredParticipants = participantsData
        .filter((p: GroupSessionParticipantInfo) => p.status === "registered")
        .map((p: GroupSessionParticipantInfo) => ({
          id: p.id,
          name: p.name || "Unknown",
          photoLink: isValidUrl(p.photoLink) ? p.photoLink : "/default-avatar.jpg",
        }));
      
      setPreviewParticipants(registeredParticipants);
      
      onSessionUpdate(GroupSessionDetails.id, {
        previewParticipants: registeredParticipants
      });
      
      return registeredParticipants;
    } catch (error: any) {
      if (error.status === 403) {
        console.warn(`Access denied to participant list for session ${GroupSessionDetails.id}. Using existing preview participants.`);
        return previewParticipants;
      }
      console.error("Error fetching preview participants:", error);
      return previewParticipants;
    }
  };
  
  useEffect(() => {
    if (studentId) {
      const checkRegistration = async () => {
        try {
          const data = await getGroupSessionParticipants(GroupSessionDetails.id);
          const isReg = data.some(
            (p: GroupSessionParticipantInfo) => p.id === studentId && p.status === "registered"
          );
          const isWait = data.some(
            (p: GroupSessionParticipantInfo) => p.id === studentId && p.status === "waiting"
          );
          setIsRegistered(isReg);
          setIsWaiting(isWait);
        } catch (error: any) {
          if (error.status === 403) {
            console.warn(`Access denied to participant list for session ${GroupSessionDetails.id}. Registration status cannot be verified.`);
            return;
          }
          console.error("Error checking registration:", error);
          if (!hasShownRegistrationError) {
            // toast.error("Failed to check registration status.");
            // setHasShownRegistrationError(true);
          }
        }
      };
      checkRegistration();
    }
  }, [studentId, GroupSessionDetails.id, refreshKey, hasShownRegistrationError, setHasShownRegistrationError]);

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!studentId) {
      router.push("/sign-in");
      return;
    }
    try {
      const res = await joinGroupSession(studentId, GroupSessionDetails.id);
      if (res.success) {
        toast.success(
          res.data?.status === "waiting"
            ? "You have been added to the waiting list."
            : "Successfully booked!"
        );
        setIsRegistered(res.data?.status === "registered");
        setIsWaiting(res.data?.status === "waiting");
        
        const newParticipants = res.data?.participants || participants;
        setParticipants(newParticipants);
        
        onSessionUpdate(GroupSessionDetails.id, {
          participants: newParticipants
        });
        
        try {
          await updatePreviewParticipants();
        } catch (error: any) {
          if (error.status !== 403) {
            console.error("Error updating preview participants after join:", error);
          }
        }
        
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error(res.message || "Failed to book session.");
      }
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Error booking session.");
    }
  };

  const handleCancel = async () => {
    if (!studentId) return;
    try {
      const res = await cancelGroupSession(studentId, GroupSessionDetails.id);
      if (res.success) {
        toast.success("Successfully cancelled!");
        setIsRegistered(false);
        setIsWaiting(false);
        
        const newParticipants = res.data?.participants || participants;
        setParticipants(newParticipants);
        
        onSessionUpdate(GroupSessionDetails.id, {
          participants: newParticipants
        });
        
        try {
          await updatePreviewParticipants();
        } catch (error: any) {
          if (error.status !== 403) {
            console.error("Error updating preview participants after cancel:", error);
          }
        }
        
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error(res.message || "Failed to cancel session.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Error cancelling session.");
    }
  };

  useEffect(() => {
    if (
      isValid(GroupSessionDetails.startTime) &&
      GroupSessionDetails.startTime < new Date()
    ) {
      toast.warning(
        `Session "${GroupSessionDetails.title}" has already ended.`
      );
    }
  }, [GroupSessionDetails.startTime, GroupSessionDetails.title]);

  useEffect(() => {
    setPreviewParticipants(GroupSessionDetails.previewParticipants);
  }, [GroupSessionDetails.previewParticipants]);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24 && diffInHours > 0) return `in ${diffInHours}h`;
    if (diffInHours <= 0) return "completed";
    
    const diffInDays = Math.ceil(diffInHours / 24);
    if (diffInDays === 1) return "tomorrow";
    if (diffInDays <= 7) return `in ${diffInDays}d`;
    
    return format(date, "MMM d, yyyy");
  };

  return (
    <motion.div
      variants={sessionCardVariants}
      whileHover="hover"
      className={`group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-5 transition-all duration-500 overflow-hidden ${
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
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300">
                <Image
                  src={GroupSessionDetails.mentor.photoLink}
                  alt={GroupSessionDetails.mentor.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  unoptimized
                  onError={() => {
                    toast.warning(`Failed to load mentor image for "${GroupSessionDetails.mentor.name}".`);
                  }}
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </div>
            </motion.div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1 group-hover:text-amber-200 transition-colors duration-300">
                {GroupSessionDetails.title}
              </h3>
              <div className="text-slate-400 text-xs">@{GroupSessionDetails.mentor.name}</div>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            {getRelativeTime(GroupSessionDetails.startTime)}
          </motion.div>
        </div>

        {/* Description */}
        <div className="pb-3 border-b border-slate-700/30">
          <motion.p
            variants={descriptionVariants}
            animate={isThisCardExpanded ? "expanded" : "collapsed"}
            className={cn(
              "text-slate-400 text-xs leading-relaxed",
              !isThisCardExpanded && shouldShowExpandButton ? "line-clamp-3" : ""
            )}
          >
            {description}
          </motion.p>
          {shouldShowExpandButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDescription}
              className="mt-1 flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors duration-200"
              aria-label={isThisCardExpanded ? "Show less description" : "Show more description"}
            >
              {isThisCardExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Session Meta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 text-xs">Duration</span>
            </div>
            <span className="text-white font-bold text-sm">{minutesToHours(GroupSessionDetails.durationInMinutes)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 text-xs">Date</span>
            </div>
            <span className="text-white font-bold text-xs">
              {isValid(GroupSessionDetails.startTime) 
                ? format(GroupSessionDetails.startTime, "MMM d, yyyy, h:mm a")
                : "Invalid date"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 text-xs">Participants</span>
            </div>
            <span className="text-white font-bold text-xs">{participants.current}/{participants.max}</span>
          </div>
        </div>

        {/* Participants Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-slate-400 text-xs">Attendees</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {previewParticipants?.slice(0, 3).map((item, index) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <div 
                    className="w-8 h-8 rounded-xl overflow-hidden border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300"
                  >
                    {item.photoLink ? (
                      <Image
                        src={item.photoLink}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                        unoptimized
                        onError={() => {
                          toast.warning(`Failed to load participant image for "${item.name}".`);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs text-white font-semibold">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700">{item.name}</TooltipContent>
              </Tooltip>
            ))}
            {participants.current > 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-600/50 flex items-center justify-center text-xs text-white font-semibold"
                  >
                    +{participants.current - 3}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700">
                  {previewParticipants?.slice(3).map(p => p.name).join(', ')} and {participants.current - previewParticipants.length} more
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {isRegistered ? (
          <Dialog>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: isCompleted ? 1 : 1.02 }}
                whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                disabled={isCompleted}
                className={`block w-full text-center px-4 py-2 rounded-lg font-medium text-sm ${
                  isCompleted
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCompleted ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Session Ended</span>
                    </>
                  ) : (
                    <>
                      <span>Cancel Registration</span>
                      <X className="w-4 h-4" />
                    </>
                  )}
                </div>
              </motion.button>
            </DialogTrigger>
            {!isCompleted && (
              <DialogContent className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl">
                <DialogTitle className="text-xl font-semibold">Cancel Registration?</DialogTitle>
                <p className="text-slate-300 mb-4">Are you sure you want to cancel your registration for this session?</p>
                <div className="flex gap-3 w-full">
                  <DialogClose
                    asChild
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold"
                      onClick={handleCancel}
                    >
                      Yes, Cancel
                    </motion.button>
                  </DialogClose>
                  <DialogClose asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300 font-semibold"
                    >
                      Keep Registration
                    </motion.button>
                  </DialogClose>
                </div>
              </DialogContent>
            )}
          </Dialog>
        ) : isWaiting ? (
          <motion.button
            whileHover={{ scale: isCompleted ? 1 : 1.02 }}
            whileTap={{ scale: isCompleted ? 1 : 0.98 }}
            className={`block w-full text-center px-4 py-2 rounded-lg font-medium text-sm ${
              isCompleted
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
            }`}
            onClick={isCompleted ? undefined : handleCancel}
            disabled={isCompleted}
          >
            <div className="flex items-center justify-center space-x-2">
              {isCompleted ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Session Ended</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>On Waiting List</span>
                </>
              )}
            </div>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: isCompleted ? 1 : 1.02 }}
            whileTap={{ scale: isCompleted ? 1 : 0.98 }}
            onClick={isCompleted ? undefined : handleJoin}
            disabled={isCompleted}
            className={`block w-full text-center px-4 py-2 rounded-lg font-medium text-sm ${
              isCompleted
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isCompleted ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Session Ended</span>
                </>
              ) : (
                <>
                  <span>Book Session</span>
                  <BookOpen className="w-4 h-4" />
                </>
              )}
            </div>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Colors array
export const colors = [
  {
    bg: "bg-orange-800",
    text: "text-orange-500",
    accent: "bg-orange-600 hover:bg-orange-700",
  },
  {
    bg: "bg-blue-800",
    text: "text-blue-500",
    accent: "bg-blue-600 hover:bg-blue-700",
  },
  {
    bg: "bg-green-800",
    text: "text-green-500",
    accent: "bg-green-600 hover:bg-green-700",
  },
  {
    bg: "bg-red-800",
    text: "text-red-500",
    accent: "bg-red-600 hover:bg-red-700",
  },
  {
    bg: "bg-purple-800",
    text: "text-purple-500",
    accent: "bg-purple-600 hover:bg-purple-700",
  },
  {
    bg: "bg-yellow-800",
    text: "text-yellow-500",
    accent: "bg-yellow-600 hover:bg-yellow-700",
  },
  {
    bg: "bg-teal-800",
    text: "text-teal-500",
    accent: "bg-teal-600 hover:bg-teal-700",
  },
  {
    bg: "bg-pink-800",
    text: "text-pink-500",
    accent: "bg-pink-600 hover:bg-pink-700",
  },
  {
    bg: "bg-orange-900/30",
    text: "text-orange-400",
    accent: "bg-orange-500 hover:bg-orange-600",
  },
  {
    bg: "bg-gray-800/30",
    text: "text-gray-200",
    accent: "bg-gray-600 hover:bg-gray-700",
  },
  {
    bg: "bg-orange-800/30",
    text: "text-orange-300",
    accent: "bg-orange-500 hover:bg-orange-600",
  },
  {
    bg: "bg-gray-700/30",
    text: "text-gray-300",
    accent: "bg-gray-500 hover:bg-gray-600",
  },
  {
    bg: "bg-indigo-800",
    text: "text-indigo-400",
    accent: "bg-indigo-600 hover:bg-indigo-700",
  },
  {
    bg: "bg-cyan-800",
    text: "text-cyan-400",
    accent: "bg-cyan-600 hover:bg-cyan-700",
  },
  {
    bg: "bg-emerald-800",
    text: "text-emerald-400",
    accent: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    bg: "bg-amber-800",
    text: "text-amber-400",
    accent: "bg-amber-600 hover:bg-amber-700",
  },
];

export default GroupSessionPage;