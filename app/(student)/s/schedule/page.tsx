"use client";

import { getStudentBookedSessions } from "@/app/lib/fetchers/student";
import { BookedSessionType } from "@/app/types";
import CalendarMonthSwitcher from "@/app/ui/CalendarUI/CalendarMonthSwitcher";
import CalendarUI from "@/app/ui/CalendarUI/CalendarUI";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Schedule = () => {
  const [bookedSessions, setBookedSessions] = useState<BookedSessionType[]>([]);
  const router = useRouter();
  const sid = localStorage.getItem("student-id");
  if (!sid) {
    router.push("/sign-in");
  }
  useEffect(() => {
    const fn = async () => {
      if (sid) {
        const data: BookedSessionType[] = await getStudentBookedSessions(sid);
        setBookedSessions(data);
      }
    };
    fn();
  }, []);
  return (
    <div className=" flex flex-col h-screen">
      <div className="h-[100px] border-b flex items-center justify-between px-2">
        <div className="flex gap-2 items-center">
          <div>
            <CalendarMonthSwitcher />
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <CalendarUI bookedSessions={bookedSessions} />
      </div>
    </div>
  );
};

export default Schedule;
