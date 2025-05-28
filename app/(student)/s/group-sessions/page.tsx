"use client";
import { getGroupSessionsList, getGroupSessionParticipants } from "@/app/lib/fetchers";
import { GroupSessionInfoType, GroupSessionParticipantInfo } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { isValid } from "date-fns";
import { Users, Hourglass } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CountdownTimer from "@/app/ui/CountdownTimer";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { joinGroupSession, cancelGroupSession } from "@/app/lib/mutations";

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

const GroupSessionPage = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

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
      } catch (error: any) {
        console.error("Error fetching group sessions:", error.message, error.stack);
        toast.error("Failed to load group sessions. Please try again later.");
        setGsInfo([]);
      }
    };
    fn();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900/50 p-6 md:p-10">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Group Sessions</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gsInfo ? (
              gsInfo.length > 0 ? (
                gsInfo.map((grpSession, i) => (
                  <GroupSessionCard
                    key={grpSession.id}
                    GroupSessionDetails={grpSession}
                    ColorTheme={colors[i % colors.length]}
                    studentId={studentId}
                    onSessionUpdate={updateSessionData}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400">
                  No sessions available.
                </div>
              )
            ) : (
              <div className="col-span-full text-center text-gray-400">
                Loading sessions...
              </div>
            )}
          </div>
        </div>
        <ScrollBar orientation="vertical" />
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
};



const GroupSessionCard = ({ GroupSessionDetails, ColorTheme, studentId, onSessionUpdate }: Props) => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false); // New state for waiting status
  const [participants, setParticipants] = useState<{ current: number; max: number }>(
    GroupSessionDetails.participants
  );
  const [previewParticipants, setPreviewParticipants] = useState(GroupSessionDetails.previewParticipants);
  const [refreshKey, setRefreshKey] = useState(0);
  
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
      
      // Update the parent component's state as well
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

  let hasShownRegistrationError = false;
  
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
            toast.error("Failed to check registration status.");
            hasShownRegistrationError = true;
          }
        }
      };
      checkRegistration();
    }
  }, [studentId, GroupSessionDetails.id, refreshKey]);

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
        
        // Update participants count
        const newParticipants = res.data?.participants || participants;
        setParticipants(newParticipants);
        
        // Update parent component's participant count
        onSessionUpdate(GroupSessionDetails.id, {
          participants: newParticipants
        });
        
        // Update preview participants immediately (only if we have permission)
        try {
          await updatePreviewParticipants();
        } catch (error: any) {
          // If we can't update preview participants due to permissions, that's OK
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
        
        // Update participants count
        const newParticipants = res.data?.participants || participants;
        setParticipants(newParticipants);
        
        // Update parent component's participant count
        onSessionUpdate(GroupSessionDetails.id, {
          participants: newParticipants
        });
        
        // Update preview participants immediately (only if we have permission)
        try {
          await updatePreviewParticipants();
        } catch (error: any) {
          // If we can't update preview participants due to permissions, that's OK
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
      GroupSessionDetails.startTime < new Date("2025-05-27T13:47:00+06:00")
    ) {
      toast.warning(
        `Session "${GroupSessionDetails.title}" has already started or ended.`
      );
    }
  }, [GroupSessionDetails.startTime, GroupSessionDetails.title]);

  // Update local preview participants when props change
  useEffect(() => {
    setPreviewParticipants(GroupSessionDetails.previewParticipants);
  }, [GroupSessionDetails.previewParticipants]);

  return (
    <Card
      className={cn(
        "relative bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl",
        ColorTheme.bg
      )}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
              <Image
                src={GroupSessionDetails.mentor.photoLink}
                alt={GroupSessionDetails.mentor.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
                unoptimized
                onError={() => {
                  toast.warning(`Failed to load mentor image for "${GroupSessionDetails.mentor.name}".`);
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{GroupSessionDetails.mentor.name}</p>
              <p className="text-xs text-gray-400">Mentor</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {previewParticipants?.slice(0, 3).map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
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
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-white">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{item.name}</TooltipContent>
              </Tooltip>
            ))}
            {participants.current > 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white flex items-center justify-center text-xs text-white flex-shrink-0">
                    +{participants.current - 3}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {previewParticipants?.slice(3).map(p => p.name).join(', ')} and {participants.current - previewParticipants.length} more
                </TooltipContent>
              </Tooltip>
            )}
          </div>

        </div>
        <CardTitle className="text-xl font-bold text-white line-clamp-2">
          {GroupSessionDetails.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-300 line-clamp-3 mb-4">{GroupSessionDetails.description}</p>
        <div className="flex flex-col gap-2 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <CountdownTimer
              startTime={GroupSessionDetails.startTime}
              durationInMinutes={GroupSessionDetails.durationInMinutes}
            />
          </div>
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-orange-500" />
            <span>{minutesToHours(GroupSessionDetails.durationInMinutes)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span>
              {participants.current}/{participants.max} participants
            </span>
          </div>
        </div>
        {isRegistered ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className={cn(
                  "mt-4 w-full bg-red-800 text-white hover:bg-red-900 transition-colors duration-300",
                  ColorTheme.accent
                )}
              >
                Cancel Now
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white">
              <DialogTitle className="text-xl">Are you sure you want to cancel?</DialogTitle>
              <div className="flex gap-x-2 w-full">
                <DialogClose
                  className="w-[150px] p-2 bg-red-800 rounded-sm hover:bg-red-900"
                  onClick={handleCancel}
                >
                  Yes
                </DialogClose>
                <DialogClose className="w-[150px] p-2 bg-gray-700 rounded-sm hover:bg-gray-600">
                  No
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        ) : isWaiting ? (
          <Button
            className={cn(
              "mt-4 w-full bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-300",
              ColorTheme.accent
            )}
            onClick={handleCancel} // Allow cancellation from waiting list
          >
            Waiting
          </Button>
        ) : (
          <Button
            className={cn(
              "mt-4 w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200",
              ColorTheme.accent
            )}
            onClick={handleJoin}
          >
            Book Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};


export const colors = [
  // Original colors with added accent
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

  // New transparent variants with matching accents
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
  
  // Additional complementary colors
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