"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionInfoType } from "../types";
import { Clock, Banknote, Globe, MapPin, Star, Calendar, Edit, Trash2, Award, Play, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import MentorScheduleForStudent from "./MentorScheduleForStudent";
import { minutesToHours } from "../(student)/s/group-sessions/page";
import { deleteSession, updateSession } from "@/app/lib/mutations/mentor";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EditSession from "../(mentor)/m/mysessions/(ui)/Edit";
import { motion } from "framer-motion";

type Props = {
  sessionDetails: SessionInfoType;
  student: boolean;
  checkoutpage?: boolean;
  dSession?: (sessID: string) => void;
  updateSessions?: (s: SessionInfoType) => void;
};

const SessionCard = ({
  sessionDetails,
  student,
  checkoutpage,
  dSession,
  updateSessions,
}: Props) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<{[key: string]: boolean}>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const cardKey = sessionDetails.sessionId || `card-${Math.random()}`;

  const handleDeleteSession = async () => {
    if (sessionDetails.sessionId) {
      const res = await deleteSession(sessionDetails.sessionId);
      if (res) {
        if (dSession) {
          dSession(sessionDetails.sessionId);
        }
        toast.success("Session deleted successfully");
      } else {
        toast.error("Failed to delete session");
      }
    } else {
      toast.error("Session ID not found");
    }
    setShowDeleteDialog(false);
  };

  const safeValue = (value: any, fallback: string = "Not specified") => {
    if (value === null || value === undefined || value === "" || 
        (Array.isArray(value) && value.length === 0)) {
      return fallback;
    }
    return value;
  };

  const displayDuration = () => {
    const duration = sessionDetails.DurationInMinutes;
    if (!duration || duration === 0) return "Duration not set";
    return minutesToHours(duration);
  };

  const displayPrice = () => {
    const price = sessionDetails.Price;
    if (price === null || price === undefined || price === 0) {
      return "Free";
    }
    return `${price} UCOIN`;
  };

  const displayMedium = () => {
    const medium = sessionDetails.session_medium;
    if (!medium || medium.length === 0) return "Online";
    return medium.join(" • ");
  };

  const description = safeValue(sessionDetails.Description, "Discover new skills and insights in this comprehensive learning session designed to help you grow.");
  const shouldShowExpandButton = description.length > 150;
  
  const isThisCardExpanded = isDescriptionExpanded[cardKey] || false;

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescriptionExpanded(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative h-full",
        student ? "w-full max-w-xl" : "flex-1 min-w-0"
      )}
    >
      <Card className="relative h-full bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-200 ">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        <CardHeader className="p-4 relative z-10">
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-orange-600 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-md">
              {safeValue(sessionDetails.type, "Session")}
            </span>
          </div>
          <CardTitle className="text-lg font-bold text-white leading-tight text-white     group-hover:text-orange-100 transition-colors duration-200 mb-3 mt-10">
            {safeValue(sessionDetails.title, "Untitled Session")}
          </CardTitle>
          {student && (
            <div className="flex items-center gap-2 p-2 bg-gray-800/60 rounded-lg border border-gray-600/50 backdrop-blur-sm">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-600/50">
                  <Image
                    src={safeValue(sessionDetails.mentorImageLink, "/default-mentor.png")}
                    alt="mentor"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/default-mentor.png";
                    }}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {safeValue(sessionDetails.mentorName, "Expert Mentor")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400">4.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-gray-400">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4 relative z-10">
          <div className="relative">
            <CardDescription 
              className={cn(
                "text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-200 break-words",
                !isThisCardExpanded && shouldShowExpandButton ? "line-clamp-3" : ""
              )}
            >
              {description}
            </CardDescription>
            
            {shouldShowExpandButton && (
              <button
                onClick={toggleDescription}
                className="mt-1 flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors duration-200 relative z-20"
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
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-gray-800/40 border-gray-600/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-orange-500/30">
              <div className="p-1.5 rounded-md bg-orange-500/20 text-orange-400">
                <Clock className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Duration
                </p>
                <p className="text-xs font-semibold text-white truncate">
                  {displayDuration()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg border bg-gray-800/40 border-gray-600/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-orange-500/30">
              <div className="p-1.5 rounded-md bg-orange-500/20 text-orange-400">
                <Banknote className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Price
                </p>
                <p className="text-xs font-semibold text-white truncate">
                  {displayPrice()}
                </p>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg border bg-gray-800/40 border-gray-600/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-orange-500/30">
              <div className="p-1.5 rounded-md bg-orange-500/20 text-orange-400">
                {sessionDetails.session_medium?.includes("online") || !sessionDetails.session_medium ? 
                  <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Medium
                </p>
                <p className="text-xs font-semibold text-white capitalize truncate">
                  {displayMedium()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 relative z-20">
          {!student ? (
            <div className="flex gap-2 w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/50 hover:border-orange-500/50 rounded-lg transition-all duration-200 group/btn relative z-30 pointer-events-auto h-8 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1 group-hover/btn:rotate-12 transition-transform duration-200" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white rounded-2xl">
                  <DialogTitle className="text-xl font-bold text-orange-400">
                    Edit Session
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Update session details below.
                  </DialogDescription>
                  <EditSession
                    SessionDetails={sessionDetails}
                    updateSessionDetails={updateSessions}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-gray-600/50 hover:border-red-500/50 rounded-lg transition-all duration-200 group/btn relative z-30 pointer-events-auto h-8 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform duration-200" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white rounded-2xl">
                  <DialogTitle className="text-xl font-bold text-red-400">
                    Delete Session
                  </DialogTitle>
                  <DialogDescription className="text-gray-300 mb-6">
                    Are you sure you want to delete this session? This action cannot be undone.
                  </DialogDescription>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteDialog(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteSession}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                {!checkoutpage && (
                  <Button 
                    size="sm"
                    className="w-full relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-size-200 hover:bg-pos-100 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 group/btn border border-orange-500/20 z-30 pointer-events-auto h-8 text-xs shadow-lg hover:shadow-orange-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Calendar className="w-3 h-3 group-hover/btn:rotate-12 transition-transform duration-200" />
                      <span className="font-bold">Book Session</span>
                      <Play className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Button>
                )}
              </PopoverTrigger>
              <PopoverContent
                className="w-full max-w-sm bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl"
                sideOffset={12}
                align="center"
              >
                <MentorScheduleForStudent sessionDetails={sessionDetails} />
              </PopoverContent>
            </Popover>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SessionCard;










// ---------------------------- PURPLE COLOR ------------------------------

// "use client";
// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { SessionInfoType } from "../types";
// import { 
//   Clock, 
//   Banknote, 
//   Globe, 
//   MapPin, 
//   Star, 
//   Calendar, 
//   Edit, 
//   Trash2,
//   Award,
//   Play,
//   ChevronDown,
//   ChevronUp
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import MentorScheduleForStudent from "./MentorScheduleForStudent";
// import { minutesToHours } from "../(student)/s/group-sessions/page";
// import { deleteSession, updateSession } from "@/app/lib/mutations/mentor";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import EditSession from "../(mentor)/m/mysessions/(ui)/Edit";
// import { motion } from "framer-motion";

// type Props = {
//   sessionDetails: SessionInfoType;
//   student: boolean;
//   checkoutpage?: boolean;
//   dSession?: (sessID: string) => void;
//   updateSessions?: (s: SessionInfoType) => void;
// };

// const SessionCard = ({
//   sessionDetails,
//   student,
//   checkoutpage,
//   dSession,
//   updateSessions,
// }: Props) => {
//   // Use sessionId to create unique state for each card
//   const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<{[key: string]: boolean}>({});
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);

//   // Create unique key for this card's state
//   const cardKey = sessionDetails.sessionId || `card-${Math.random()}`;

//   const handleDeleteSession = async () => {
//     if (sessionDetails.sessionId) {
//       const res = await deleteSession(sessionDetails.sessionId);
//       if (res) {
//         if (dSession) {
//           dSession(sessionDetails.sessionId);
//         }
//         toast.success("Session deleted successfully");
//       } else {
//         toast.error("Failed to delete session");
//       }
//     } else {
//       toast.error("Session ID not found");
//     }
//     setShowDeleteDialog(false);
//   };

//   // Helper function to safely display values
//   const safeValue = (value: any, fallback: string = "Not specified") => {
//     if (value === null || value === undefined || value === "" || 
//         (Array.isArray(value) && value.length === 0)) {
//       return fallback;
//     }
//     return value;
//   };

//   const displayDuration = () => {
//     const duration = sessionDetails.DurationInMinutes;
//     if (!duration || duration === 0) return "Duration not set";
//     return minutesToHours(duration);
//   };

//   const displayPrice = () => {
//     const price = sessionDetails.Price;
//     if (price === null || price === undefined || price === 0) {
//       return "Free";
//     }
//     return `${price} UCOIN`;
//   };

//   const displayMedium = () => {
//     const medium = sessionDetails.session_medium;
//     if (!medium || medium.length === 0) return "Online";
//     return medium.join(" • ");
//   };

//   const description = safeValue(sessionDetails.Description, "Discover new skills and insights in this comprehensive learning session designed to help you grow.");
//   const shouldShowExpandButton = description.length > 150;
  
//   // Get the expanded state for this specific card
//   const isThisCardExpanded = isDescriptionExpanded[cardKey] || false;

//   const toggleDescription = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsDescriptionExpanded(prev => ({
//       ...prev,
//       [cardKey]: !prev[cardKey]
//     }));
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       whileHover={{ scale: 1.02 }}
//       className={cn(
//         "group relative h-full",
//         student ? "w-full max-w-xl" : "flex-1 min-w-0"
//       )}
//     >
//       <Card className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-200">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
//         {/* Header */}
//         <CardHeader className="p-4 relative z-10">
//           {/* Session Type - Top Right Corner */}
//           <div className="absolute top-4 right-4 z-20">
//             <span className="bg-orange-800 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap">
//               {safeValue(sessionDetails.type, "Session")}
//             </span>
//           </div>

//           {/* Title - Single Row with proper truncation */}
//           <CardTitle className="text-lg font-bold text-white leading-tight pr-20 truncate group-hover:text-purple-100 transition-colors duration-200 mb-3">
//             {safeValue(sessionDetails.title, "Untitled Session")}
//           </CardTitle>

//           {/* Mentor Info */}
//           {student && (
//             <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
//               <div className="relative">
//                 <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-slate-600/50">
//                   <Image
//                     src={safeValue(sessionDetails.mentorImageLink, "/default-mentor.png")}
//                     alt="mentor"
//                     width={40}
//                     height={40}
//                     className="object-cover w-full h-full"
//                     unoptimized
//                     onError={(e) => {
//                       const target = e.target as HTMLImageElement;
//                       target.src = "/default-mentor.png";
//                     }}
//                   />
//                 </div>
//                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="font-semibold text-white text-sm truncate">
//                   {safeValue(sessionDetails.mentorName, "Expert Mentor")}
//                 </p>
//                 <div className="flex items-center gap-2 mt-0.5">
//                   <div className="flex items-center gap-1">
//                     <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
//                     <span className="text-xs font-medium text-amber-400">4.9</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Award className="w-3 h-3 text-purple-400" />
//                     <span className="text-xs text-slate-400">Verified</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardHeader>

//         {/* Content */}
//         <CardContent className="p-4 pt-0 space-y-4 relative z-10">
//           {/* Description with proper overflow handling */}
//           <div className="relative">
//             <CardDescription 
//               className={cn(
//                 "text-sm text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-200 break-words",
//                 !isThisCardExpanded && shouldShowExpandButton ? "line-clamp-3" : ""
//               )}
//             >
//               {description}
//             </CardDescription>
            
//             {/* Expand/Collapse button for description */}
//             {shouldShowExpandButton && (
//               <button
//                 onClick={toggleDescription}
//                 className="mt-1 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200 relative z-20"
//               >
//                 {isThisCardExpanded ? (
//                   <>
//                     <span>Show less</span>
//                     <ChevronUp className="w-3 h-3" />
//                   </>
//                 ) : (
//                   <>
//                     <span>Show more</span>
//                     <ChevronDown className="w-3 h-3" />
//                   </>
//                 )}
//               </button>
//             )}
//           </div>

//           {/* Session Details Grid - 2 items per row with reduced gap */}
//           <div className="grid grid-cols-2 gap-2">
//             {/* Duration */}
//             <div className="flex items-center gap-2 p-2 rounded-lg border bg-blue-500/10 border-blue-500/20 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]">
//               <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
//                 <Clock className="w-3 h-3" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
//                   Duration
//                 </p>
//                 <p className="text-xs font-semibold text-white truncate">
//                   {displayDuration()}
//                 </p>
//               </div>
//             </div>

//             {/* Price */}
//             <div className="flex items-center gap-2 p-2 rounded-lg border bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]">
//               <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
//                 <Banknote className="w-3 h-3" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
//                   Price
//                 </p>
//                 <p className="text-xs font-semibold text-white truncate">
//                   {displayPrice()}
//                 </p>
//               </div>
//             </div>

//             {/* Medium - spans full width */}
//             <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg border bg-purple-500/10 border-purple-500/20 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]">
//               <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
//                 {sessionDetails.session_medium?.includes("online") || !sessionDetails.session_medium ? 
//                   <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
//                   Medium
//                 </p>
//                 <p className="text-xs font-semibold text-white capitalize truncate">
//                   {displayMedium()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </CardContent>

//         {/* Footer */}
//         <CardFooter className="p-4 pt-0 relative z-20">
//           {!student ? (
//             // Mentor Actions - Smaller buttons
//             <div className="flex gap-2 w-full">
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="flex-1 text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/50 hover:border-purple-500/50 rounded-lg transition-all duration-200 group/btn relative z-30 pointer-events-auto h-8 text-xs"
//                   >
//                     <Edit className="w-3 h-3 mr-1 group-hover/btn:rotate-12 transition-transform duration-200" />
//                     Edit
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl">
//                   <DialogTitle className="text-xl font-bold text-purple-400">
//                     Edit Session
//                   </DialogTitle>
//                   <DialogDescription className="text-slate-300">
//                     Update session details below.
//                   </DialogDescription>
//                   <EditSession
//                     SessionDetails={sessionDetails}
//                     updateSessionDetails={updateSessions}
//                   />
//                 </DialogContent>
//               </Dialog>
              
//               <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//                 <DialogTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-slate-600/50 hover:border-red-500/50 rounded-lg transition-all duration-200 group/btn relative z-30 pointer-events-auto h-8 text-xs"
//                   >
//                     <Trash2 className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform duration-200" />
//                     Delete
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl">
//                   <DialogTitle className="text-xl font-bold text-red-400">
//                     Delete Session
//                   </DialogTitle>
//                   <DialogDescription className="text-slate-300 mb-6">
//                     Are you sure you want to delete this session? This action cannot be undone.
//                   </DialogDescription>
//                   <div className="flex gap-3 justify-end">
//                     <Button
//                       variant="ghost"
//                       onClick={() => setShowDeleteDialog(false)}
//                       className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={handleDeleteSession}
//                       className="bg-red-600 hover:bg-red-700 text-white"
//                     >
//                       Delete
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           ) : (
//             // Student Actions - Smaller button
//             <Popover>
//               <PopoverTrigger asChild>
//                 {!checkoutpage && (
//                   <Button 
//                     size="sm"
//                     className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-size-200 hover:bg-pos-100 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 group/btn border border-purple-500/20 z-30 pointer-events-auto h-8 text-xs"
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
//                     <span className="relative z-10 flex items-center justify-center gap-2">
//                       <Calendar className="w-3 h-3 group-hover/btn:rotate-12 transition-transform duration-200" />
//                       <span className="font-bold">Book Session</span>
//                       <Play className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-200" />
//                     </span>
//                   </Button>
//                 )}
//               </PopoverTrigger>
//               <PopoverContent
//                 className="w-full max-w-sm bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
//                 sideOffset={12}
//                 align="center"
//               >
//                 <MentorScheduleForStudent sessionDetails={sessionDetails} />
//               </PopoverContent>
//             </Popover>
//           )}
//         </CardFooter>
//       </Card>
//     </motion.div>
//   );
// };

// export default SessionCard;