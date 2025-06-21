"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { Star, User, BookOpen, X, GraduationCap, Mail, Search, Sparkles, Crown, Award, MapIcon } from "lucide-react";
import Link from "next/link";

interface MentorType {
  mentorId: string;
  userId: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  sessionsTaken: number;
  avgRating: string;
  allInterests: string[];
  interests?: string[];
  statistics?: {
    totalSessions: number;
    averageRating: string;
    [key: string]: any;
  };
  sessions: {
    session: {
      session_id: string;
      session_type: "OneOnOne" | "Group";
      session_title: string;
      description: string;
      duration_mins: number;
      price?: number;
      is_online?: boolean;
      is_offline?: boolean;
      start_time?: string;
      end_time?: string;
      max_participants?: number;
      registered_participants?: number;
      platform?: string;
      status?: string;
    };
    reviews: {
      review_id: string;
      student_id: string;
      mentor_id: string;
      rating: number;
      review_text: string;
      created_at: string;
      student: {
        student_id: string;
        name: string;
        username: string;
        email: string;
      };
    }[];
  }[];
}

interface ApiResponse {
  success: boolean;
  data: MentorType[];
  message?: string;
}

const getAvatar = (username: string): string => {
  return `https://robohash.org/${username}.png?size=120x120`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 1,
    },
  },
};

const MentorShowCard: React.FC<{ mentor: MentorType }> = ({ mentor }) => {
  const levelConfig = {
    Beginner: {
      color: "from-orange-400 to-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-400/30",
      text: "text-orange-300",
      icon: <Sparkles className="w-3 h-3" />,
    },
    Intermediate: {
      color: "from-orange-400 to-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-400/30",
      text: "text-orange-300",
      icon: <BookOpen className="w-3 h-3" />,
    },
    Advanced: {
      color: "from-orange-400 to-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-400/30",
      text: "text-orange-300",
      icon: <Award className="w-3 h-3" />,
    },
    Expert: {
      color: "from-orange-400 to-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-400/30",
      text: "text-orange-300",
      icon: <Crown className="w-3 h-3" />,
    },
  };

  const config = levelConfig[mentor.level];

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <motion.div
                key={`star-${i}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              >
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              </motion.div>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <motion.div
                key={`star-${i}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="relative w-4 h-4"
              >
                <Star className="w-4 h-4 text-gray-600" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                </div>
              </motion.div>
            );
          } else {
            return (
              <motion.div
                key={`star-${i}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              >
                <Star className="w-4 h-4 text-gray-600" />
              </motion.div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-orange-400/80 rounded-2xl overflow-hidden shadow-lg transition-all duration-300"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
            <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-gray-600/50 hover:ring-orange-400/80 transition-all duration-300">
              <img
                src={getAvatar(mentor.username)}
                alt={`${mentor.name}'s avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-avatar.png";
                }}
              />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-md`}
            >
              {config.icon}
            </motion.div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-white text-lg mb-1 truncate"
            >
              {mentor.name}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm mb-2"
            >
              @{mentor.username}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              {renderStars(mentor.statistics?.averageRating || mentor.avgRating || "0.0")}
              <span className="text-sm font-bold text-white">
                {mentor.statistics?.averageRating || mentor.avgRating || "0.0"}
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
            {mentor.bio || "Passionate mentor ready to guide your learning journey"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.color}`} />
              <span className="text-xs text-gray-500 font-medium">LEVEL</span>
            </div>
            <div className={`px-3 py-1.5 ${config.bg} ${config.border} border rounded-xl flex items-center gap-2`}>
              {config.icon}
              <span className={`text-xs font-semibold ${config.text}`}>{mentor.level}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
              <span className="text-xs text-gray-500 font-medium">SESSIONS</span>
            </div>
            <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-400/30 rounded-xl flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-orange-300" />
              <span className="text-xs font-semibold text-orange-300">
                {mentor.statistics?.totalSessions || mentor.sessionsTaken || 0}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">CONTACT</span>
          </div>
          <p className="text-sm text-gray-300 truncate bg-gray-800/50 px-3 py-2 rounded-lg">{mentor.email}</p>
        </motion.div>

        {((mentor.interests?.length ?? 0) > 0 || (mentor.allInterests?.length ?? 0) > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
                <span className="text-xs text-gray-500 font-medium">SKILLS</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(mentor.interests || mentor.allInterests || []).slice(0, 3).map((interest, index) => (
                  <motion.span
                    key={`all-interest-${index}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="px-2 py-1 bg-orange-500/10 border border-orange-400/30 text-orange-300 rounded-lg text-xs font-medium"
                  >
                    {interest}
                  </motion.span>
                ))}
                {((mentor.interests?.length ?? 0) > 3 || (mentor.allInterests?.length ?? 0) > 3) && (
                  <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded-lg text-xs">
                    +{((mentor.interests?.length ?? mentor.allInterests?.length ?? 0) - 3)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full"
        >
          <Link
            href={`/m/mprofile/${mentor.mentorId}`}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-500 transition-all duration-300 shadow-md hover:shadow-lg block text-center"
            aria-label={`View details for ${mentor.name}`}
          >
            <span className="flex items-center justify-center gap-2">
              <MapIcon className="w-4 h-4" />
              See Details
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FindOtherMentors: React.FC = () => {
  const [mentors, setMentors] = useState<MentorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchMentors = async () => {
    if (typeof window === "undefined") return;

    const mentorId = localStorage.getItem("mentor-id");
    if (!mentorId) {
      toast.error("Mentor ID not found. Please sign in.");
      router.push("/sign-in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: ApiRequestType = {
        endpoint: "api/mentor/findmentor/all/other",
        method: "GET",
        auth: true,
      };

      const response = await apiRequest(request) as ApiResponse;

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch mentors");
      }

      // Map the backend data to our frontend interface
      const mappedMentors = response.data.map(mentor => ({
        ...mentor,
        allInterests: mentor.interests || mentor.allInterests || [],
        avgRating: mentor.statistics?.averageRating || mentor.avgRating || "0.0",
        sessionsTaken: mentor.statistics?.totalSessions || mentor.sessionsTaken || 0
      }));

      setMentors(mappedMentors || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while fetching mentors";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [router]);

  const filteredMentors = mentors.filter((mentor) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      mentor.name.toLowerCase().includes(query) ||
      mentor.email.toLowerCase().includes(query) ||
      (mentor.allInterests && mentor.allInterests.some((interest) => interest.toLowerCase().includes(query))) ||
      (mentor.interests && mentor.interests.some((interest) => interest.toLowerCase().includes(query)))
    );
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
            <h3 className="text-white font-semibold mb-2">Loading Mentors</h3>
            <p className="text-slate-400 text-sm">
              Fetching a list of all available mentors...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900/50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-md shadow-lg"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <X className="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Oops! Something went wrong</h3>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchMentors}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-500 transition-all duration-300 shadow-md"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900/50">
      <ScrollArea className="h-screen">
        <div className="max-w-7xl mx-auto p-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-orange-500 rounded-2xl -z-10"
                />
              </motion.div>
              <div className="text-left">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-bold text-white"
                >
                  Explore Mentors
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-400 text-sm mt-1"
                >
                  Discover other mentors and their expertise
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative max-w-lg mx-auto"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-orange-400/80 focus:border-orange-400/80 rounded-xl px-6 py-4 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition-all duration-300 shadow-md"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key="mentor-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-16"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <div className="w-1 h-8 bg-orange-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-white">All Mentors</h2>
                  <div className="flex-1 h-px bg-gray-700/50" />
                </motion.div>

                {filteredMentors.length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-20 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-24 h-24 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-8"
                    >
                      <User className="w-12 h-12 text-gray-400" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-bold text-white mb-3"
                    >
                      No Mentors Found
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto"
                    >
                      {searchQuery
                        ? "No mentors match your search criteria. Try adjusting your search terms."
                        : "No mentors available at this time. Check back later!"}
                    </motion.p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMentors.map((mentor) => (
                      <MentorShowCard key={mentor.mentorId} mentor={mentor} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FindOtherMentors;