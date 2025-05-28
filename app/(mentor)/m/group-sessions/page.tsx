"use client";
import { GroupSessionInfoType } from "@/app/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, Hourglass, Trash2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jakarta } from "@/app/utils/font";
import Link from "next/link";
import { getGroupSessionListByMentorId } from "@/app/lib/fetchers";
import { deleteGroupSession } from "@/app/lib/mutations/mentor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditGroupSession from "@/app/ui/EditGroupSession";
import { toast } from "sonner";
import CountdownTimer from "@/app/ui/CountdownTimer";

const GroupSessions = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGroupSessions = async () => {
      const mID = localStorage.getItem("mentor-id");
      if (!mID) {
        toast.error("Mentor ID not found. Please sign in.");
        router.push("/sign-in");
        return;
      }
      try {
        const data: GroupSessionInfoType[] = await getGroupSessionListByMentorId(mID);
        setGsInfo(data.map(session => ({
          ...session,
          startTime: new Date(session.startTime),
        })));
      } catch (error) {
        toast.error("Failed to fetch group sessions.");
        console.error(error);
      }
    };
    fetchGroupSessions();
  }, [router]);

  const deleteGroupSessionHandler = async (sessID: string) => {
    try {
      console.log("Attempting to delete group session:", sessID);
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

  return (
    <ScrollArea className="h-screen w-screen w-full">
      <div className="min-h-screen bg-black p-6">
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h1
              className={`${jakarta.className} text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent`}
            >
              My Group Sessions
            </h1>
            <Link href="/m/group-sessions/create">
              <Button
                className="bg-orange-800 hover:bg-orange-600 text-white text-1xl font-small transition-all duration-300 shadow-lg"
              >
                Create New Group Session
              </Button>
            </Link>
          </div>
          <div className="border-b border-gray-800 w-full"></div>
        </div>
        <div className="space-y-4">
          {gsInfo && gsInfo.length === 0 ? (
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
              <p className="text-gray-400 text-lg">No group sessions created yet.</p>
              <Link href="/m/group-sessions/create" className="mt-4">
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                >
                  Create your first group session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gsInfo?.map((grpSession) => (
                <div
                  key={grpSession.id}
                  className="hover:scale-[1.01] transition-transform duration-200"
                >
                  <GroupSessionCard
                    GroupSessionDetails={grpSession}
                    dGroupSession={deleteGroupSessionHandler}
                    onEdit={() => setOpenEditDialog(grpSession.id)}
                    onDelete={() => setOpenDeleteDialog(grpSession.id)}
                  />
                  {openEditDialog === grpSession.id && (
                    <Dialog open onOpenChange={() => setOpenEditDialog(null)}>
                      <DialogContent className="bg-gray-900 border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Edit Group Session</DialogTitle>
                        </DialogHeader>
                        <EditGroupSession
                          GroupSessionDetails={grpSession}
                          onClose={() => setOpenEditDialog(null)}
                          onUpdate={handleUpdateSession}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  {openDeleteDialog === grpSession.id && (
                    <Dialog open onOpenChange={() => setOpenDeleteDialog(null)}>
                      <DialogContent className="bg-gray-900 border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Delete Group Session</DialogTitle>
                        </DialogHeader>
                        <p className="text-gray-300 mb-4">Are you sure you want to delete this group session? This action cannot be undone.</p>
                        <div className="flex gap-x-2">
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => deleteGroupSessionHandler(grpSession.id)}
                          >
                            Yes, Delete
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            onClick={() => setOpenDeleteDialog(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

type Props = {
  GroupSessionDetails: GroupSessionInfoType;
  dGroupSession: (sessID: string) => void;
  onEdit: () => void;
  onDelete: () => void;
};

const GroupSessionCard = ({ GroupSessionDetails, dGroupSession, onEdit, onDelete }: Props) => {
  const minutesToHoursLocal = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes > 0 ? `${remainingMinutes}m` : ""}`;
  };

  const bgColors = [
    "bg-orange-800",
    "bg-blue-800",
    "bg-red-800",
    "bg-green-800",
    "bg-purple-800",
    "bg-teal-800",
    "bg-indigo-800",
    "bg-pink-800",
    "bg-amber-800",
    "bg-cyan-800",
    "bg-lime-800",
    "bg-emerald-800",
    "bg-fuchsia-800",
    "bg-rose-800",
    "bg-violet-800",
    "bg-yellow-800",
    "bg-sky-800",
    "bg-stone-800",
    "bg-neutral-800",
    "bg-gray-800",
    "bg-slate-800",
    "bg-zinc-800",
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

  const visibleParticipants = GroupSessionDetails.previewParticipants?.slice(0, 3) || [];
  const overflowCount = Math.max(0, GroupSessionDetails.participants.current - visibleParticipants.length);
  const hasOverflow = overflowCount > 0;

  return (
    <Card className={`${bgColor} border border-gray-800 rounded-xl shadow-lg transition-transform duration-300 text-white`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center font-semibold text-white">
            {/* <span>{GroupSessionDetails.mentor.name}</span> */}
          </div>
          {/* <div className="flex items-center font-bold gap-x-2 text-white">
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
          </div> */}



<div className="flex items-center gap-2">
  {/* Participant avatars */}
  <div className="flex -space-x-2">
    {visibleParticipants.map((participant, index) => (
      <Tooltip key={`${participant.id}-${index}`}>
        <TooltipTrigger asChild>
          <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-700 overflow-hidden">
            {participant.photoLink ? (
              <Image
                src={participant.photoLink}
                alt={participant.name}
                width={32}
                height={32}
                className="object-cover w-full h-full"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/default-avatar.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                {participant.name.charAt(0)}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{participant.name}</TooltipContent>
      </Tooltip>
    ))}
    
    {/* Simple overflow counter without tooltip */}
    {hasOverflow && (
      <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
        +{overflowCount}
      </div>
    )}
  </div>

  {/* Participant count */}
  <div className="text-sm font-medium">
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
            <CountdownTimer startTime={GroupSessionDetails.startTime} durationInMinutes={GroupSessionDetails.durationInMinutes} />
          </span>
        </div>
        <div className="flex gap-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Edit button clicked for session:", GroupSessionDetails.id);
                  onEdit();
                }}
                className="text-white hover:text-orange-300"
              >
                <Edit size={18} className="mr-1" /> 
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Session</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Delete button clicked for session:", GroupSessionDetails.id);
                  onDelete();
                }}
                className="text-white hover:text-red-300"
              >
                <Trash2 size={18} className="mr-1" /> 
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Session</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/m/group-sessions/${GroupSessionDetails.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-blue-300"
                >
                  <Eye size={18} className="mr-1" /> 
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>View Session Details</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GroupSessions;