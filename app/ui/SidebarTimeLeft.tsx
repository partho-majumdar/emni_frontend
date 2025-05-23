import React, { useEffect, useState } from "react";
import { NextBookedType } from "../types";
import { differenceInMinutes, format } from "date-fns";
import { minutesToHours } from "../(student)/s/group-sessions/page";
import { cn } from "@/lib/utils";

type Props = {
  BookedSession: NextBookedType;
  status: "upcoming" | "goingon";
};

const calculateTimeLeft = (t: Date, d: number) => {
  const endtime = new Date(t.getTime() + d * 60 * 1000);
  const now = new Date();
  const diff = differenceInMinutes(endtime, now);
  return diff;
};
const SidebarTimeLeft = ({ BookedSession, status }: Props) => {
  const [timeLeft, setTimeLeft] = useState(
    status === "goingon"
      ? calculateTimeLeft(
          BookedSession.StartTime,
          BookedSession.DurationInMinutes
        )
      : differenceInMinutes(BookedSession.StartTime, new Date())
  );
  if (timeLeft <= 0) {
  }
  useEffect(() => {
    const ticktick = setInterval(() => {
      const newTimeLeft =
        status === "goingon"
          ? calculateTimeLeft(
              BookedSession.StartTime,
              BookedSession.DurationInMinutes
            )
          : differenceInMinutes(BookedSession.StartTime, new Date());

      setTimeLeft(newTimeLeft);
    }, 60 * 1000);
    return () => clearInterval(ticktick);
  }, [BookedSession, status]);

  return (
    <div
      className={cn(
        "flex flex-col  p-2 ",
        status === "upcoming"
          ? "bg-blue-900/20 text-blue-400"
          : "bg-red-900/20 text-red-400"
      )}
    >
      <div className="my-2">
        <span
          className={cn(
            "text-black px-2 rounded-md py-1",
            status === "upcoming" ? "bg-blue-500" : "bg-red-500"
          )}
        >
          {status}
        </span>
      </div>
      <span>{format(BookedSession.StartTime, "PPp")}</span>
      <span className="text-xl font-semibold">
        {BookedSession.SessionTitle}
      </span>
      {status === "upcoming" && (
        <span className="flex  my-2">Starts in {minutesToHours(timeLeft)}</span>
      )}{" "}
      {status === "goingon" && (
        <span className="flex  my-2">Ends in {minutesToHours(timeLeft)}</span>
      )}
    </div>
  );
};

export default SidebarTimeLeft;
