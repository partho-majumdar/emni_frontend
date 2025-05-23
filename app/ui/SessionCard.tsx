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
import { Clock, Banknote } from "lucide-react";
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
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditSession from "../(mentor)/m/mysessions/(ui)/Edit";
import { Session } from "node:inspector/promises";

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
    <Card className="w-[350px] my-5 text-lg border-none bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-3xl">{sessionDetails.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-lg">
        {student && (
          <div className="flex gap-x-2">
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-white">
              <Image
                src={sessionDetails.mentorImageLink as string}
                alt="mentor"
                width={50}
                height={50}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <span>{sessionDetails.mentorName}</span>
          </div>
        )}
        <div>
          <span className="bg-orange-800 px-2 rounded-md py-1">
            {sessionDetails.type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          <span>{minutesToHours(sessionDetails.DurationInMinutes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="w-6 h-6" />
          <span>{sessionDetails.Price}</span>
        </div>
        {/* <div className="flex gap-2"> */}
        {/*   {sessionDetails.session_medium.map((medium) => ( */}
        {/*     <span key={medium} className=" bg-secondary px-2 py-1 rounded"> */}
        {/*       {medium} */}
        {/*     </span> */}
        {/*   ))} */}
        {/* </div> */}
        <CardDescription className="whitespace-pre-line text-lg">
          {sessionDetails.Description}
        </CardDescription>
      </CardContent>
      {!student && (
        <CardFooter className="flex gap-2">
          <Dialog>
            <DialogTrigger>
              <span className="cursor-pointer">Edit</span>
            </DialogTrigger>
            <DialogContent className="min-w-1/2">
              <DialogTitle className="text-3xl"></DialogTitle>
              <DialogDescription></DialogDescription>
              <EditSession
                SessionDetails={sessionDetails}
                updateSessionDetails={updateSessions}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            onClick={handleDeleteSession}
          >
            Delete
          </Button>
        </CardFooter>
      )}
      {student && (
        <CardFooter className="flex justify-end gap-2">
          <Popover>
            <PopoverTrigger>
              {!checkoutpage && (
                <span
                  className={cn(
                    theme_border,
                    hover_style,
                    smooth_hover,
                    "px-4 cursor-pointer",
                  )}
                >
                  Book Session
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-[400px]">
              <MentorScheduleForStudent sessionDetails={sessionDetails} />
            </PopoverContent>
          </Popover>
        </CardFooter>
      )}
    </Card>
  );
};

export default SessionCard;
