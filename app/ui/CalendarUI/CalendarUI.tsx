"use client";
// import { useCalendarContext } from '../../calendar-context'
// import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  format,
  isWithinInterval,
  isBefore,
  startOfToday,
} from "date-fns";

import { cn } from "@/lib/utils";
import { AvalabilityType, BookedSessionType } from "@/app/types";
import { useCalendarContext } from "./CalendarContext";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SessionDetailsSheet from "./SessionDetailsSheet";
type Props = {
  availabilities?: AvalabilityType[];
  bookedSessions?: BookedSessionType[];
  updateAvailabilities?: (availability: AvalabilityType) => void;
};

export default function CalendarUI(props: Props) {
  //   const { date, events, setDate, setMode } = useCalendarContext();
  const { date } = useCalendarContext();

  // Get the first day of the month
  const monthStart = startOfMonth(date);
  // Get the last day of the month
  const monthEnd = endOfMonth(date);

  // Get the first Satday of the first week (may be in previous month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 });
  // Get the last Friday of the last week (may be in next month)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });

  // Get all days between start and end
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });
  // console.log(calendarDays);

  const today = new Date();

  // Filter Availabilities on this calendar views only
  // this is for mentors view
  const visibleAvailabilities = props.availabilities?.filter(
    (item) =>
      isWithinInterval(item.start, {
        start: calendarStart,
        end: calendarEnd,
      }) ||
      isWithinInterval(item.end, {
        start: calendarStart,
        end: calendarEnd,
      }),
  );
  // this is for student view
  const visibleBookedSessions = props.bookedSessions?.filter(
    (item) =>
      isWithinInterval(item.start, {
        start: calendarStart,
        end: calendarEnd,
      }) ||
      isWithinInterval(item.end, {
        start: calendarStart,
        end: calendarEnd,
      }),
  );

  return (
    <div className="flex overflow-auto divide-x h-full ">
      {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map(
        (day, ithDayWeek) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center flex-grow text-lg font-medium border-b border-border",
              "flex flex-col h-full w-[200px]",
            )}
          >
            <div className="border-b text-muted-foreground ">{day}</div>
            <div className=" flex flex-col flex-grow">
              {calendarDays.map((calDate, ithDayOfCal) => {
                if (ithDayOfCal % 7 === ithDayWeek) {
                  return (
                    <div
                      key={ithDayOfCal}
                      className={cn(
                        "flex-grow border-b p-3 h-[100px]",
                        isWithinInterval(calDate, {
                          start: monthStart,
                          end: monthEnd,
                        })
                          ? ""
                          : "bg-muted/50 text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "rounded-full p-2",
                          isSameDay(today, calDate)
                            ? "text-orange-500 text-3xl"
                            : "",
                        )}
                      >
                        {calDate.getDate()}
                      </span>
                      <div className="flex flex-col items-center my-2">
                        {visibleAvailabilities &&
                          visibleAvailabilities.map(
                            (item, i) =>
                              isSameDay(item.start, calDate) && (
                                <Sheet key={i}>
                                  <SheetTrigger>
                                    <span
                                      key={i}
                                      className={cn(
                                        "px-2 rounded-lg",
                                        item.booked.length > 0
                                          ? "bg-orange-800"
                                          : "bg-transparent border-2 border-orange-500",
                                      )}
                                    >
                                      {format(item.start, "p")} to{" "}
                                      {format(item.end, "p")}
                                    </span>
                                  </SheetTrigger>
                                  <SheetContent className="px-4">
                                    <SheetTitle className="p-5"></SheetTitle>
                                    <SessionDetailsSheet
                                      bookedSession={
                                        item.booked.length > 0
                                          ? {
                                              session_type: "1:1",
                                              sessionId: item.booked,
                                              start: item.start,
                                              end: item.end,
                                              medium: "offline",
                                            }
                                          : null
                                      }
                                      availability={item}
                                      updateAvailabilities={
                                        props.updateAvailabilites &&
                                        props.updateAvailabilities
                                      }
                                    />
                                  </SheetContent>
                                </Sheet>
                              ),
                          )}
                        {visibleBookedSessions &&
                          visibleBookedSessions.map(
                            (item, i) =>
                              isSameDay(item.start, calDate) && (
                                <Sheet key={i}>
                                  <SheetTrigger>
                                    <span
                                      className={cn(
                                        "px-2 rounded-lg",
                                        isBefore(item.start, startOfToday())
                                          ? "bg-black text-zinc-500"
                                          : "bg-green-900 text-green-500",
                                      )}
                                    >
                                      {format(item.start, "p")} to{" "}
                                      {format(item.end, "p")}
                                    </span>
                                  </SheetTrigger>
                                  <SheetContent className="px-4">
                                    <SheetTitle className="p-5"></SheetTitle>
                                    <SessionDetailsSheet bookedSession={item} />
                                  </SheetContent>
                                </Sheet>
                              ),
                          )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
