"use client";
import { getGroupSessionListByMentorId } from "@/app/lib/fetchers";
import { GroupSessionInfoType } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isValid, format } from "date-fns";
import { Users, Hourglass, Calendar, Clock, Search, X, BookOpen, AlertCircle, Trash2, Edit, Eye, Plus, Zap, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CountdownTimer from "@/app/ui/CountdownTimer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { deleteGroupSession } from "@/app/lib/mutations/mentor";
import EditGroupSession from "@/app/ui/EditGroupSession";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { jakarta } from "@/app/utils/font";
import { cn } from "@/lib/utils";

// Utility functions
export const minutesToHours = (minutes: number): string => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Invalid duration";
  }
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (remain > 0) {
    return hours === 0 ? `${remain}m` : `${hours}h ${remain}m`;
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
      delayChildren: 0.1,
    },
  },
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
      mass: 1,
    },
  },
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
      damping: 20,
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
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

const descriptionVariants = {
  collapsed: { height: "auto", opacity: 1 },
  expanded: { height: "auto", opacity: 1 },
};

const GroupSessions = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to update specific session data
  const updateSessionData = (sessionId: string, updatedData: Partial<GroupSessionInfoType>) => {
    setGsInfo((prev) =>
      prev?.map((session) => (session.id === sessionId ? { ...session, ...updatedData } : session)) ?? null
    );
  };

  // Get session status
  const getSessionStatus = (startTime: Date, durationInMinutes: number) => {
    const now = new Date();
    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(startTime.getTime() + durationInMinutes * 60 * 1000);
    if (now >= sessionStart && now <= sessionEnd) return "Running";
    return sessionEnd < now ? "Completed" : "Upcoming";
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    if (!gsInfo) return [];

    let filtered = gsInfo;

    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter((session) => {
        const status = getSessionStatus(session.startTime, session.durationInMinutes);
        return selectedFilter === "upcoming"
          ? status === "Upcoming" || status === "Running"
          : status === "Completed";
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (session) =>
          session.title.toLowerCase().includes(query) ||
          session.description.toLowerCase().includes(query) ||
          session.mentor.name.toLowerCase().includes(query)
      );
    }

    // Sort sessions: Running first, then Upcoming by closest date, Completed last
    return filtered.sort((a, b) => {
      const statusA = getSessionStatus(a.startTime, a.durationInMinutes);
      const statusB = getSessionStatus(b.startTime, b.durationInMinutes);
      if (statusA === statusB) {
        return a.startTime.getTime() - b.startTime.getTime();
      }
      if (statusA === "Running") return -1;
      if (statusB === "Running") return 1;
      return statusA === "Upcoming" ? -1 : 1;
    });
  }, [gsInfo, searchQuery, selectedFilter]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchGroupSessions = async () => {
      const mID = localStorage.getItem("mentor-id");
      if (!mID) {
        toast.error("Mentor ID not found. Please sign in.");
        router.push("/sign-in");
        setLoading(false);
        return;
      }
      try {
        const data = await getGroupSessionListByMentorId(mID);
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
            durationInMinutes:
              Number.isFinite(session.durationInMinutes) && session.durationInMinutes > 0
                ? session.durationInMinutes
                : 60,
            mentor: {
              id: isValidString(session.mentor?.id)
                ? session.mentor.id
                : `invalid-mentor-${Math.random()}`,
              name: isValidString(session.mentor?.name) ? session.mentor.name : "Unknown Mentor",
              photoLink: isValidUrl(session.mentor?.photoLink)
                ? session.mentor.photoLink
                : "/default-avatar.jpg",
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
          if (
            session.participants?.current &&
            session.participants?.max &&
            session.participants.current > session.participants.max
          ) {
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
    fetchGroupSessions();
  }, [router]);

  const deleteGroupSessionHandler = async (sessID: string) => {
    try {
      const res = await deleteGroupSession(sessID);
      if (res.success) {
        setGsInfo((prev) => prev?.filter((session) => session.id !== sessID) ?? null);
        toast.success("Group session deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete group session.");
      }
    } catch (error) {
      toast.error("Error deleting group session.");
      console.error(error);
    } finally {
      setOpenDeleteDialog(null);
    }
  };

  const handleUpdateSession = (updatedSession: GroupSessionInfoType) => {
    setGsInfo((prev) =>
      prev?.map((session) => (session.id === updatedSession.id ? updatedSession : session)) ?? null
    );
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

  const upcomingCount = gsInfo?.filter((s) => {
    const status = getSessionStatus(s.startTime, s.durationInMinutes);
    return status === "Upcoming" || status === "Running";
  }).length || 0;
  const completedCount = gsInfo?.filter((s) => getSessionStatus(s.startTime, s.durationInMinutes) === "Completed").length || 0;
  const activeParticipants = gsInfo?.reduce((acc, session) => acc + session.participants.current, 0) || 0;

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
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"
                >
                  <Users className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${jakarta.className} text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent`}
                  >
                    Group Sessions
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-sm"
                  >
                    Manage and track your mentoring sessions
                  </motion.p>
                </div>
              </div>
              <Link href="/m/group-sessions/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create New Session
                </motion.button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4">
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
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{completedCount}</div>
                    <div className="text-xs text-emerald-300 font-medium">Completed</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
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
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-lg font-bold text-white">{activeParticipants}</div>
                    <div className="text-xs text-purple-300 font-medium">Participants</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-1 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-1"
              >
                {(["all", "upcoming", "completed"] as const).map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFilter(filter)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
                      selectedFilter === filter
                        ? "bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white shadow-lg shadow-violet-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/40"
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
                      {filter !== "all" && (
                        <span className="bg-slate-900/60 px-2 py-0.5 rounded text-xs">
                          {filter === "upcoming" ? upcomingCount : completedCount}
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
                  <Input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                    aria-label="Search group sessions"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-white transition-colors"
                      aria-label="Clear search"
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
                  <Users className="w-10 h-10 text-slate-400" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-3"
                >
                  {selectedFilter === "all" ? "No sessions scheduled" : `No ${selectedFilter} sessions`}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 mb-6"
                >
                  {selectedFilter === "all"
                    ? "Ready to start mentoring? Create your first group session."
                    : `You have no ${selectedFilter} sessions at the moment.`}
                </motion.p>
                <Link href="/m/group-sessions/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create Your First Session
                  </motion.button>
                </Link>
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
                    dGroupSession={deleteGroupSessionHandler}
                    onEdit={() => setOpenEditDialog(grpSession.id)}
                    onDelete={() => setOpenDeleteDialog(grpSession.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dialogs */}
        {gsInfo?.map((grpSession) => (
          <React.Fragment key={grpSession.id}>
            {/* Edit Dialog */}
            {openEditDialog === grpSession.id && (
              <Dialog open onOpenChange={() => setOpenEditDialog(null)}>
                <DialogContent className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Group Session</DialogTitle>
                  </DialogHeader>
                  <EditGroupSession
                    GroupSessionDetails={grpSession}
                    onClose={() => setOpenEditDialog(null)}
                    onUpdate={handleUpdateSession}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Delete Dialog */}
            {openDeleteDialog === grpSession.id && (
              <Dialog open onOpenChange={() => setOpenDeleteDialog(null)}>
                <DialogContent className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Delete Group Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <p className="text-slate-300 text-base">
                      Are you sure you want to delete <span className="font-semibold text-white">"{grpSession.title}"</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-4">
                      <Button
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl flex-1"
                        onClick={() => deleteGroupSessionHandler(grpSession.id)}
                        aria-label={`Delete session ${grpSession.title}`}
                      >
                        Yes, Delete Session
                      </Button>
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm font-semibold px-6 py-3 rounded-xl flex-1"
                          aria-label="Cancel deletion"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </React.Fragment>
        ))}
      </ScrollArea>
    </div>
  );
};

type Props = {
  GroupSessionDetails: GroupSessionInfoType;
  dGroupSession: (sessID: string) => void;
  onEdit: () => void;
  onDelete: () => void;
};

const getSessionStatus = (startTime: Date, durationInMinutes: number) => {
  const now = new Date();
  const sessionStart = new Date(startTime);
  const sessionEnd = new Date(startTime.getTime() + durationInMinutes * 60 * 1000);
  if (now >= sessionStart && now <= sessionEnd) return "Running";
  return sessionEnd < now ? "Completed" : "Upcoming";
};

const GroupSessionCard = ({ GroupSessionDetails, dGroupSession, onEdit, onDelete }: Props) => {
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<{ [key: string]: boolean }>({});
  const status = getSessionStatus(GroupSessionDetails.startTime, GroupSessionDetails.durationInMinutes);
  const isRunning = status === "Running";
  const isCompleted = status === "Completed";

  const cardKey = GroupSessionDetails.id || `card-${Math.random()}`;
  const isThisCardExpanded = isDescriptionExpanded[cardKey] || false;

  const visibleParticipants = GroupSessionDetails.previewParticipants?.slice(0, 3) || [];
  const overflowCount = Math.max(0, GroupSessionDetails.participants.current - visibleParticipants.length);
  const hasOverflow = overflowCount > 0;

  const safeValue = (value: string | undefined | null, fallback: string = "No description provided"): string => {
    return isValidString(value) ? value as string : String(fallback);
  };

  const description = safeValue(GroupSessionDetails.description);
  const shouldShowExpandButton = description.length > 150;

  const toggleDescription = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDescriptionExpanded((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

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

  const handleViewClick = () => {
    setIsLoadingView(true);
  };

  return (
    <motion.div
      variants={sessionCardVariants}
      whileHover="hover"
      className={`group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-5 transition-all duration-500 overflow-hidden ${
        isCompleted ? "opacity-70" : ""
      }`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
      />

      <div className="relative z-10 space-y-4">
        {/* Countdown Timer */}
        <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20 relative">
          {isRunning && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full"
            >
              LIVE
            </motion.div>
          )}
          <CountdownTimer
            startTime={GroupSessionDetails.startTime}
            durationInMinutes={GroupSessionDetails.durationInMinutes}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
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
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                    isCompleted ? "bg-emerald-500" : isRunning ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
              </div>
            </div>
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
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : isRunning
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
            }`}
          >
            {isRunning ? "Running" : getRelativeTime(GroupSessionDetails.startTime)}
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
              className="mt-1 flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors duration-200"
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
            <span className="text-white font-bold text-xs">
              {GroupSessionDetails.participants.current}/{GroupSessionDetails.participants.max}
            </span>
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
            {visibleParticipants.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="w-8 h-8 rounded-xl overflow-hidden border-2 border-slate-600/50 group-hover:border-amber-500/30 transition-colors duration-300"
              >
                {item.photoLink ? (
                  <Image
                    src={item.photoLink}
                    alt="Participant"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                    unoptimized
                    onError={() => {
                      toast.warning("Failed to load participant image.");
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs text-white font-semibold">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}
            {hasOverflow && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-600/50 flex items-center justify-center text-xs text-white font-semibold">
                +{overflowCount}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-700/30">
          <motion.button
            whileHover={{ scale: isCompleted ? 1 : 1.02 }}
            whileTap={{ scale: isCompleted ? 1 : 0.98 }}
            onClick={onEdit}
            disabled={isCompleted}
            className={`flex-1 text-center px-4 py-2 rounded-lg font-medium text-sm ${
              isCompleted
                ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
            }`}
            aria-label={`Edit session ${GroupSessionDetails.title}`}
          >
            <Edit className="w-4 h-4 mr-1 inline" />
            Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: isCompleted ? 1 : 1.02 }}
            whileTap={{ scale: isCompleted ? 1 : 0.98 }}
            onClick={onDelete}
            disabled={isCompleted}
            className={`flex-1 text-center px-4 py-2 rounded-lg font-medium text-sm ${
              isCompleted
                ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            }`}
            aria-label={`Delete session ${GroupSessionDetails.title}`}
          >
            <Trash2 className="w-4 h-4 mr-1 inline" />
            Delete
          </motion.button>

          <Link href={`/m/group-sessions/${GroupSessionDetails.id}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewClick}
              className="flex-1 text-center px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white relative overflow-hidden"
              aria-label={`View session ${GroupSessionDetails.title}`}
            >
              {isLoadingView && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center bg-orange-600/80"
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                </motion.div>
              )}
              <Eye className="w-4 h-4 mr-1 inline" />
              View
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupSessions;