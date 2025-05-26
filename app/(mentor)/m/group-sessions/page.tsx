// "use client";
// import { GroupSessionInfoType } from "@/app/types";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { colors, smooth_hover } from "@/app/ui/CustomStyles";
// import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";
// import { Clock, Edit, Hourglass, Trash2 } from "lucide-react";
// import { minutesToHours } from "@/app/(student)/s/group-sessions/page";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { getGroupSessionListByMentorId } from "@/app/lib/fetchers";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// const GroupSessions = () => {
//   const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
//   const router = useRouter();
//   useEffect(() => {
//     const fn = async () => {
//       const mID = localStorage.getItem("mentor-id");
//       if (mID) {
//         const data: GroupSessionInfoType[] =
//           await getGroupSessionListByMentorId(mID);
//         setGsInfo(data);
//       } else {
//         console.error("Mentor ID not found in local storage");
//       }
//     };
//     fn();
//   }, []);

//   return (
//     <ScrollArea className="h-screen">
//       <div className="p-16 flex justify-center flex-wrap gap-10">
//         <Card
//           className="w-[500px] hover:bg-zinc-900 flex items-center justify-center"
//           onClick={() => {
//             router.push("/m/group-sessions/create");
//           }}
//         >
//           <span className="text-2xl font-semibold select-none">
//             Create A New Group Session
//           </span>
//         </Card>
//         {gsInfo &&
//           gsInfo.map((grpSession, i) => (
//             <GroupSessionCard
//               key={grpSession.id}
//               GroupSessionDetails={grpSession}
//               ColorTheme={colors[i % colors.length]}
//             />
//           ))}
//       </div>
//       <ScrollBar orientation="vertical" />
//     </ScrollArea>
//   );
// };

// type Props = {
//   GroupSessionDetails: GroupSessionInfoType;
//   ColorTheme: {
//     bg: string;
//     text: string;
//   };
// };

// const GroupSessionCard = ({ GroupSessionDetails, ColorTheme }: Props) => {
//   const router = useRouter();
//   const handleGSClick = () => {
//     router.replace(
//       `/m/group-sessions/${GroupSessionDetails.id}?bg=${ColorTheme.bg}&text=${ColorTheme.text}`,
//     );
//   };
//   return (
//     <Card
//       className={cn(
//         "w-[500px] hover:opacity-90 select-none border-none",
//         ColorTheme.bg,
//       )}
//       onClick={handleGSClick}
//     >
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           {/* <div className="flex items-center gap-x-2 font-semibold">
//             <Image
//               className="rounded-full border-2 border-white"
//               src={GroupSessionDetails.mentor.photoLink}
//               alt="mentor image"
//               width={50}
//               height={50}
//             />
//             <span>{GroupSessionDetails.mentor.name}</span>
//           </div> */}
//           <div className="flex items-center font-bold gap-x-2">
//             <div className="flex">
//               {GroupSessionDetails.previewParticipants.map((item, i) => {
//                 return (
//                   <Tooltip key={i}>
//                     <TooltipTrigger className="-ml-2">
//                       <span className="w-[40px] h-[40px] overflow-hidden">
//                         <Image
//                           key={i}
//                           src={item.photoLink}
//                           alt=""
//                           width={40}
//                           height={40}
//                           className="rounded-full  border-2 border-white  "
//                           unoptimized
//                         />
//                       </span>
//                     </TooltipTrigger>
//                     <TooltipContent>{item.name}</TooltipContent>
//                   </Tooltip>
//                 );
//               })}
//             </div>
//             <div>
//               {GroupSessionDetails.participants.current}/
//               {GroupSessionDetails.participants.max}
//             </div>
//           </div>
//         </div>
//         <CardTitle className={cn("text-6xl font-black ", ColorTheme.text)}>
//           {GroupSessionDetails.title}
//         </CardTitle>
//         <div className="flex justify-between my-2">
//           <span className="flex flex-col  gap-y-4 font-semibold">
//             <span className="flex gap-x-2">
//               <Hourglass />
//               {minutesToHours(GroupSessionDetails.durationInMinutes)}
//             </span>
//             <span className="flex gap-x-2">
//               <Clock />
//               {format(GroupSessionDetails.startTime, "Pp")}
//             </span>
//           </span>
//         </div>
//       </CardHeader>
//     </Card>
//   );
// };

// export default GroupSessions;


// ----------------- above code written by rafi --------------------


"use client";
import { GroupSessionInfoType } from "@/app/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, Hourglass, Trash2, Edit } from "lucide-react";
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
                          onUpdate={handleUpdateSession} // Pass the callback
                        />
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
};

const GroupSessionCard = ({ GroupSessionDetails, dGroupSession, onEdit }: Props) => {
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
            {/* <span className="flex gap-x-2 items-center">
              <span>Status:</span> {GroupSessionDetails.status}
            </span> */}
            <CountdownTimer startTime={GroupSessionDetails.startTime} durationInMinutes={GroupSessionDetails.durationInMinutes} />
          </span>
        </div>
        <div className="flex gap-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-white hover:text-orange-300"
          >
            <Edit size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dGroupSession(GroupSessionDetails.id)}
            className="text-white hover:text-red-300"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GroupSessions;