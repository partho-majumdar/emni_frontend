// "use client";
// import React from "react";
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
// import { Clock, Banknote } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { hover_style, smooth_hover, theme_border } from "./CustomStyles";
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
//   DialogClose,
//   DialogTrigger,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import EditSession from "../(mentor)/m/mysessions/(ui)/Edit";
// import { Session } from "node:inspector/promises";

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
//   };
//   return (
//     <Card className="w-[350px] my-5 text-lg border-none bg-zinc-900/50">
//       <CardHeader>
//         <CardTitle className="text-3xl">{sessionDetails.title}</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4 text-lg">
//         {student && (
//           <div className="flex gap-x-2">
//             <div className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-white">
//               <Image
//                 src={sessionDetails.mentorImageLink as string}
//                 alt="mentor"
//                 width={50}
//                 height={50}
//                 className="object-cover w-full h-full"
//                 unoptimized
//               />
//             </div>
//             <span>{sessionDetails.mentorName}</span>
//           </div>
//         )}
//         <div>
//           <span className="bg-orange-800 px-2 rounded-md py-1">
//             {sessionDetails.type}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <Clock className="w-6 h-6" />
//           <span>{minutesToHours(sessionDetails.DurationInMinutes)}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Banknote className="w-6 h-6" />
//           <span>{sessionDetails.Price}</span>
//         </div>
//         {/* <div className="flex gap-2"> */}
//         {/*   {sessionDetails.session_medium.map((medium) => ( */}
//         {/*     <span key={medium} className=" bg-secondary px-2 py-1 rounded"> */}
//         {/*       {medium} */}
//         {/*     </span> */}
//         {/*   ))} */}
//         {/* </div> */}
//         <CardDescription className="whitespace-pre-line text-lg">
//           {sessionDetails.Description}
//         </CardDescription>
//       </CardContent>
//       {!student && (
//         <CardFooter className="flex gap-2">
//           <Dialog>
//             <DialogTrigger>
//               <span className="cursor-pointer">Edit</span>
//             </DialogTrigger>
//             <DialogContent className="min-w-1/2">
//               <DialogTitle className="text-3xl"></DialogTitle>
//               <DialogDescription></DialogDescription>
//               <EditSession
//                 SessionDetails={sessionDetails}
//                 updateSessionDetails={updateSessions}
//               />
//             </DialogContent>
//           </Dialog>
//           <Button
//             variant="destructive"
//             size="sm"
//             className="cursor-pointer"
//             onClick={handleDeleteSession}
//           >
//             Delete
//           </Button>
//         </CardFooter>
//       )}
//       {student && (
//         <CardFooter className="flex justify-end gap-2">
//           <Popover>
//             <PopoverTrigger>
//               {!checkoutpage && (
//                 <span
//                   className={cn(
//                     theme_border,
//                     hover_style,
//                     smooth_hover,
//                     "px-4 cursor-pointer",
//                   )}
//                 >
//                   Book Session
//                 </span>
//               )}
//             </PopoverTrigger>
//             <PopoverContent className="w-[400px]">
//               <MentorScheduleForStudent sessionDetails={sessionDetails} />
//             </PopoverContent>
//           </Popover>
//         </CardFooter>
//       )}
//     </Card>
//   );
// };

// export default SessionCard;


// ---------------------------- above code written by rafi --------------------------------------



"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionInfoType } from "../types";
import { Clock, Banknote, User, Calendar, Edit, Trash2, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { hover_style, smooth_hover, theme_border } from "./CustomStyles";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MentorScheduleForStudent from "./MentorScheduleForStudent";
import { minutesToHours } from "../(student)/s/group-sessions/page";
import { deleteSession, updateSession } from "@/app/lib/mutations/mentor";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditSession from "../(mentor)/m/mysessions/(ui)/Edit";

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
  };

  return (
    <Card className="w-full max-w-md border border-gray-700 bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg flex flex-col min-h-0">
      <CardHeader className="p-5 pb-0">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-xl font-semibold text-white line-clamp-2">
            {sessionDetails.title}
          </CardTitle>
          <span className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1 rounded-full whitespace-nowrap">
            {sessionDetails.type}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {student && (
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600">
              <Image
                src={sessionDetails.mentorImageLink as string}
                alt="mentor"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-sm text-gray-300">{sessionDetails.mentorName}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-800/50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm text-white">
                {minutesToHours(sessionDetails.DurationInMinutes)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-800/50 rounded-lg">
              <Banknote className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Price</p>
              <p className="text-sm text-white">{sessionDetails.Price} UCOIN</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-800/50 rounded-lg">
              {sessionDetails.session_medium.includes("online") ? (
                <Globe className="w-4 h-4 text-orange-400" />
              ) : (
                <MapPin className="w-4 h-4 text-orange-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400">Medium</p>
              <p className="text-sm text-white">
                {sessionDetails.session_medium.length > 0
                  ? sessionDetails.session_medium.join(", ")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <CardDescription className="text-sm text-gray-300 whitespace-pre-wrap break-words">
          {sessionDetails.Description}
        </CardDescription>
      </CardContent>

      {!student && (
        <CardFooter className="flex justify-end gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800/30 p-1 text-xs"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle className="text-xl">Edit Session</DialogTitle>
              <DialogDescription>Update session details below.</DialogDescription>
              <EditSession
                SessionDetails={sessionDetails}
                updateSessionDetails={updateSessions}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400/80 hover:text-red-300 hover:bg-red-500/10 p-1 text-xs"
            onClick={handleDeleteSession}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}

      {student && (
        <CardFooter className="p-5 pt-0 flex justify-end">
          <Popover>
            <PopoverTrigger asChild>
              {!checkoutpage && (
                <Button
                  className="bg-orange-500/90 hover:bg-orange-600 text-white px-3 py-1.5 text-sm"
                  size="sm"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Book
                </Button>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-md p-0 border-gray-700">
              <MentorScheduleForStudent sessionDetails={sessionDetails} />
            </PopoverContent>
          </Popover>
        </CardFooter>
      )}
    </Card>
  );
};

export default SessionCard;