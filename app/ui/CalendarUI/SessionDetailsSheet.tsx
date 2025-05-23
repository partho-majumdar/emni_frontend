"use client";
import { getSessionBySessionID } from "@/app/lib/fetchers/sessions";
import {
  AvalabilityType,
  BookedSessionType,
  SessionInfoType,
} from "@/app/types";
import { cn } from "@/lib/utils";
import { format, intervalToDuration } from "date-fns";
import Image from "next/image";
import React, { useEffect } from "react";
import { Trash } from "lucide-react";
import { deleteAvailability } from "@/app/lib/mutations/mentor";
import { toast } from "sonner";

type Props = {
  bookedSession: BookedSessionType | null;
  availability: AvalabilityType;
  updateAvailabilities: (avail: AvalabilityType) => void;
};

const SessionDetailsSheet = ({
  bookedSession,
  availability,
  updateAvailabilities,
}: Props) => {
  const [sessionDetails, setSessionDetails] =
    React.useState<SessionInfoType | null>(null);

  const handleDeleteAvail = async () => {
    const res = await deleteAvailability(availability);
    if (res) {
      updateAvailabilities(availability);
      toast.success("Availability Deleted");
    } else {
      toast.error("Failed Deleting Availability");
    }
  };
  let duration;
  if (!bookedSession) {
    duration = intervalToDuration({
      start: availability.start,
      end: availability.end,
    });
  } else {
    duration = intervalToDuration({
      start: bookedSession.start,
      end: bookedSession.end,
    });
  }

  useEffect(() => {
    const fn = async () => {
      if (bookedSession) {
        const data: SessionInfoType = await getSessionBySessionID(
          bookedSession.sessionId,
        );
        setSessionDetails(data);
      }
    };
    fn();
  }, []);

  return (
    <div>
      {sessionDetails && bookedSession && (
        <div className="flex flex-col ">
          <span className="text-xl font-semibold my-2">
            {format(bookedSession.start, "PP")}
          </span>
          <div className="py-1 my-1">
            <span className="bg-orange-800 rounded-lg px-2">
              {duration.years && <span>{duration.years} years</span>}
              {duration.months && <span>{duration.months} months</span>}
              {duration.days && <span>{duration.days} days</span>}
              {duration.hours && (
                <span>
                  {duration.hours} {duration.hours > 1 ? "hours " : "hour "}
                </span>
              )}

              {duration.minutes && <span>{duration.minutes} minutes</span>}
            </span>
          </div>
          <span
            className={cn(
              "w-[200px] flex justify-center px-2 rounded-lg",
              "bg-green-900 text-green-500",
            )}
          >
            {format(bookedSession.start, "p")} to{" "}
            {format(bookedSession.end, "p")}
          </span>
          <span className="font-semibold text-4xl">{sessionDetails.title}</span>
          <span className="bg-orange-800 px-2 py-1 rounded-md my-2 ">
            {sessionDetails.type}
          </span>
          <span className="flex my-2  items-center gap-x-2">
            <Image
              src={sessionDetails.mentorImageLink}
              alt="Mentor"
              width={40}
              height={40}
              className="rounded-full mr-2 border-2 border-white"
            />
            <span className="flex flex-col font-semibold">
              <span className="text-sm">Mentor</span>
              <span className="text-xl">{sessionDetails.mentorName}</span>
            </span>
          </span>
          {/* <span className="flex gap-x-2 my-2"> */}
          {/*   {sessionDetails.session_medium.map((item, i) => { */}
          {/*     return ( */}
          {/*       <span key={i} className="bg-gray-600 px-2 rounded-md"> */}
          {/*         {item} */}
          {/*       </span> */}
          {/*     ); */}
          {/*   })} */}
          {/* </span> */}
          <span className="text-gray-500/80 font-semibold">Description</span>
          <span>{sessionDetails.Description}</span>
          <div className="my-8 flex flex-col">
            <span className="text-3xl font-semibold">Appointment Details</span>
            <div className="my-3">
              <span className="bg-orange-800 px-2 rounded-xl">
                {bookedSession.medium}
              </span>
            </div>
            {bookedSession.medium === "online" && (
              <div className="flex flex-col">
                <span className="text-xl">Meeting Link</span>
              </div>
            )}
          </div>
        </div>
      )}
      {!bookedSession && (
        <div className="flex flex-col">
          <span className="text-3xl">Availability</span>
          <div>
            <span className="bg-orange-800 rounded-lg px-2">
              {duration.years && <span>{duration.years} years</span>}
              {duration.months && <span>{duration.months} months</span>}
              {duration.days && <span>{duration.days} days</span>}
              {duration.hours && (
                <span>
                  {duration.hours} {duration.hours > 1 ? "hours " : "hour "}
                </span>
              )}

              {duration.minutes && <span>{duration.minutes} minutes</span>}
            </span>
            <span>
              {availability.medium.map((m) => {
                return (
                  <span
                    key={m}
                    className="mx-2 bg-orange-800 rounded-full px-2"
                  >
                    {m}
                  </span>
                );
              })}
            </span>
          </div>
          <div className="flex gap-x-2 items-center">
            <span>from </span>
            <span className="w-[10px] h-[10px] bg-orange-500 rounded-full"></span>
            <span>{format(availability.start, "PPp")}</span>
          </div>
          <div className="flex gap-x-2 items-center">
            <span>to </span>
            <span className="w-[10px] h-[10px] bg-indigo-500 rounded-full"></span>
            <span>{format(availability.end, "PPp")}</span>
          </div>
          <div>
            <span
              className="flex gap-x-2 py-1 my-5 bg-red-500 w-[100px] items-center justify-center rounded-lg hover:opacity-70"
              onClick={handleDeleteAvail}
            >
              Delete <Trash height={20} width={20} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailsSheet;
