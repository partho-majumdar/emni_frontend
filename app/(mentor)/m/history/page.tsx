"use client";
import { GroupSessionInfoType } from "@/app/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Clock, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jakarta } from "@/app/utils/font";
import { getGroupSessionListByMentorId } from "@/app/lib/fetchers";
import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const History = () => {
  const [completedSessions, setCompletedSessions] = useState<GroupSessionInfoType[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompletedSessions = async () => {
      const mID = localStorage.getItem("mentor-id");
      if (!mID) {
        toast.error("Mentor ID not found. Please sign in.");
        router.push("/sign-in");
        return;
      }
      try {
        const data: GroupSessionInfoType[] = await getGroupSessionListByMentorId(mID);
        const now = new Date();
        // Filter completed sessions
        const completed = data
          .map((session) => ({
            ...session,
            startTime: new Date(session.startTime),
          }))
          .filter((session) => {
            const endTime = new Date(session.startTime.getTime() + session.durationInMinutes * 60 * 1000);
            return now > endTime;
          });
        setCompletedSessions(completed);
      } catch (error) {
        toast.error("Failed to fetch group session history.");
        console.error(error);
      }
    };
    fetchCompletedSessions();
  }, [router]);

  return (
    <ScrollArea className="h-screen w-screen w-full">
      <div className="min-h-screen bg-black p-6">
        <div className="flex flex-col space-y-4 mb-4">
          <h1
            className={`${jakarta.className} text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent`}
          >
            Group Session History
          </h1>
          <div className="border-b border-gray-800 w-full"></div>
        </div>
        <div className="space-y-4">
          {completedSessions && completedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 text-lg">No completed group sessions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedSessions?.map((grpSession) => (
                <GroupSessionCard
                  key={grpSession.id}
                  GroupSessionDetails={grpSession}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

// Reused GroupSessionCard component (adapted for History)
type GroupSessionCardProps = {
  GroupSessionDetails: GroupSessionInfoType;
};

const GroupSessionCard = ({ GroupSessionDetails }: GroupSessionCardProps) => {
  const minutesToHoursLocal = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes > 0 ? `${remainingMinutes}m` : ""}`;
  };

  const bgColors = [
    "bg-orange-900",
    "bg-blue-900",
    "bg-red-900",
    "bg-green-900",
    "bg-purple-900",
    "bg-teal-900",
    "bg-indigo-900",
    "bg-pink-900",
    "bg-amber-900",
    "bg-cyan-900",
    "bg-lime-900",
    "bg-emerald-900",
    "bg-fuchsia-900",
    "bg-rose-900",
    "bg-violet-900",
    "bg-yellow-900",
    "bg-sky-900",
    "bg-stone-900",
    "bg-neutral-900",
    "bg-gray-900",
    "bg-slate-900",
    "bg-zinc-900",
  ];

  const textColors = [
    "text-orange-500",
    "text-blue-500",
    "text-red-500",
    "text-green-500",
    "text-purple-500",
    "text-teal-500",
    "text-indigo-500",
    "text-pink-500",
    "text-amber-500",
    "text-cyan-500",
    "text-lime-500",
    "text-emerald-500",
    "text-fuchsia-500",
    "text-rose-500",
    "text-violet-500",
    "text-yellow-500",
    "text-sky-500",
    "text-stone-500",
    "text-neutral-500",
    "text-gray-500",
    "text-slate-500",
    "text-zinc-500",
  ];

  const colorIndex = GroupSessionDetails.id.charCodeAt(0) % bgColors.length;
  const bgColor = bgColors[colorIndex];
  const textColor = textColors[colorIndex];

  return (
    <Card className={`${bgColor} border border-gray-800 rounded-xl shadow-lg transition-transform duration-300 text-white`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center font-semibold text-white">
            {/* <span>{GroupSessionDetails.mentor.name}</span> */}
          </div>
          <div className="flex items-center font-bold gap-x-2 text-white">
            <div className="flex">
              {GroupSessionDetails.previewParticipants.map((item, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger className="-ml-2">
                    <span className="w-[40px] h-[40px] overflow-hidden">
                      <Image
                        src={item.photoLink}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-gray-700"
                        unoptimized
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{item.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            <div>
              {GroupSessionDetails.participants.current}/{GroupSessionDetails.participants.max}
            </div>
          </div>
        </div>
        <CardTitle className={`text-2xl font-bold ${textColor}`}>
          {GroupSessionDetails.title}
        </CardTitle>
        <div className="my-2 text-white">
          <p className="text-sm mb-4">{GroupSessionDetails.description}</p>
          <span className="flex flex-col gap-y-3 font-semibold">
            <span className="flex gap-x-2 items-center">
              <Hourglass size={18} />
              {minutesToHoursLocal(GroupSessionDetails.durationInMinutes)}
            </span>
            <span className="flex gap-x-2 items-center">
              <Clock size={18} />
              {format(GroupSessionDetails.startTime, "Pp")}
            </span>
            <span className="flex gap-x-2 items-center">
              <span>Status:</span> Completed
            </span>
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};

export default History;