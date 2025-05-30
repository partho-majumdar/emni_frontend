// "use client";
// // import { useCalendarContext } from '../../calendar-context'
// // import { useState } from "react";
// import {
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameDay,
//   format,
//   isWithinInterval,
//   isBefore,
//   startOfToday,
// } from "date-fns";

// import { cn } from "@/lib/utils";
// import { AvalabilityType, BookedSessionType } from "@/app/types";
// import { useCalendarContext } from "./CalendarContext";
// import {
//   Sheet,
//   SheetContent,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import SessionDetailsSheet from "./SessionDetailsSheet";
// type Props = {
//   availabilities?: AvalabilityType[];
//   bookedSessions?: BookedSessionType[];
//   updateAvailabilities?: (availability: AvalabilityType) => void;
// };

// export default function CalendarUI(props: Props) {
//   //   const { date, events, setDate, setMode } = useCalendarContext();
//   const { date } = useCalendarContext();

//   // Get the first day of the month
//   const monthStart = startOfMonth(date);
//   // Get the last day of the month
//   const monthEnd = endOfMonth(date);

//   // Get the first Satday of the first week (may be in previous month)
//   const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 });
//   // Get the last Friday of the last week (may be in next month)
//   const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });

//   // Get all days between start and end
//   const calendarDays = eachDayOfInterval({
//     start: calendarStart,
//     end: calendarEnd,
//   });
//   // console.log(calendarDays);

//   const today = new Date();

//   // Filter Availabilities on this calendar views only
//   // this is for mentors view
//   const visibleAvailabilities = props.availabilities?.filter(
//     (item) =>
//       isWithinInterval(item.start, {
//         start: calendarStart,
//         end: calendarEnd,
//       }) ||
//       isWithinInterval(item.end, {
//         start: calendarStart,
//         end: calendarEnd,
//       }),
//   );
//   // this is for student view
//   const visibleBookedSessions = props.bookedSessions?.filter(
//     (item) =>
//       isWithinInterval(item.start, {
//         start: calendarStart,
//         end: calendarEnd,
//       }) ||
//       isWithinInterval(item.end, {
//         start: calendarStart,
//         end: calendarEnd,
//       }),
//   );

//   return (
//     <div className="flex overflow-auto divide-x h-full ">
//       {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map(
//         (day, ithDayWeek) => (
//           <div
//             key={day}
//             className={cn(
//               "py-2 text-center flex-grow text-lg font-medium border-b border-border",
//               "flex flex-col h-full w-[200px]",
//             )}
//           >
//             <div className="border-b text-muted-foreground ">{day}</div>
//             <div className=" flex flex-col flex-grow">
//               {calendarDays.map((calDate, ithDayOfCal) => {
//                 if (ithDayOfCal % 7 === ithDayWeek) {
//                   return (
//                     <div
//                       key={ithDayOfCal}
//                       className={cn(
//                         "flex-grow border-b p-3 h-[100px]",
//                         isWithinInterval(calDate, {
//                           start: monthStart,
//                           end: monthEnd,
//                         })
//                           ? ""
//                           : "bg-muted/50 text-muted-foreground",
//                       )}
//                     >
//                       <span
//                         className={cn(
//                           "rounded-full p-2",
//                           isSameDay(today, calDate)
//                             ? "text-orange-500 text-3xl"
//                             : "",
//                         )}
//                       >
//                         {calDate.getDate()}
//                       </span>
//                       <div className="flex flex-col items-center my-2">
//                         {visibleAvailabilities &&
//                           visibleAvailabilities.map(
//                             (item, i) =>
//                               isSameDay(item.start, calDate) && (
//                                 <Sheet key={i}>
//                                   <SheetTrigger>
//                                     <span
//                                       key={i}
//                                       className={cn(
//                                         "px-2 rounded-lg",
//                                         item.booked.length > 0
//                                           ? "bg-orange-800"
//                                           : "bg-transparent border-2 border-orange-500",
//                                       )}
//                                     >
//                                       {format(item.start, "p")} to{" "}
//                                       {format(item.end, "p")}
//                                     </span>
//                                   </SheetTrigger>
//                                   <SheetContent className="px-4">
//                                     <SheetTitle className="p-5"></SheetTitle>
//                                     <SessionDetailsSheet
//                                       bookedSession={
//                                         item.booked.length > 0
//                                           ? {
//                                               session_type: "1:1",
//                                               sessionId: item.booked,
//                                               start: item.start,
//                                               end: item.end,
//                                               medium: "offline",
//                                             }
//                                           : null
//                                       }
//                                       availability={item}
//                                       updateAvailabilities={
//                                         props.updateAvailabilites &&
//                                         props.updateAvailabilities
//                                       }
//                                     />
//                                   </SheetContent>
//                                 </Sheet>
//                               ),
//                           )}
//                         {visibleBookedSessions &&
//                           visibleBookedSessions.map(
//                             (item, i) =>
//                               isSameDay(item.start, calDate) && (
//                                 <Sheet key={i}>
//                                   <SheetTrigger>
//                                     <span
//                                       className={cn(
//                                         "px-2 rounded-lg",
//                                         isBefore(item.start, startOfToday())
//                                           ? "bg-black text-zinc-500"
//                                           : "bg-green-900 text-green-500",
//                                       )}
//                                     >
//                                       {format(item.start, "p")} to{" "}
//                                       {format(item.end, "p")}
//                                     </span>
//                                   </SheetTrigger>
//                                   <SheetContent className="px-4">
//                                     <SheetTitle className="p-5"></SheetTitle>
//                                     <SessionDetailsSheet bookedSession={item} />
//                                   </SheetContent>
//                                 </Sheet>
//                               ),
//                           )}
//                       </div>
//                     </div>
//                   );
//                 }
//                 return null;
//               })}
//             </div>
//           </div>
//         ),
//       )}
//     </div>
//   );
// }


// --------------------------- above code written by rafi ------------------------






"use client";
import React, { useState, useEffect } from "react";
import { useCalendarContext } from "./CalendarContext";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, isWithinInterval, isBefore, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { AvalabilityType, BookedSessionType } from "@/app/types";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SessionDetailsSheet from "./SessionDetailsSheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  availabilities?: AvalabilityType[];
  bookedSessions?: BookedSessionType[];
};

export default function CalendarUI({ availabilities: initialAvailabilities = [], bookedSessions = [] }: Props) {
  const { date } = useCalendarContext();
  const [availabilities, setAvailabilities] = useState<AvalabilityType[]>(initialAvailabilities);

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  useEffect(() => {
    // Only update if initialAvailabilities has changed
    if (JSON.stringify(initialAvailabilities) !== JSON.stringify(availabilities)) {
      setAvailabilities(initialAvailabilities.map(avail => ({
        ...avail,
        start: avail.start instanceof Date ? avail.start : new Date(avail.start),
        end: avail.end instanceof Date ? avail.end : new Date(avail.end),
      })));
    }
  }, [initialAvailabilities, availabilities]);

  const handleUpdateAvailabilities = (availability: AvalabilityType, isDelete?: boolean) => {
    if (isDelete) {
      setAvailabilities((prev) => prev.filter((avail) => avail.id !== availability.id));
    } else {
      setAvailabilities((prev) =>
        prev.some((avail) => avail.id === availability.id)
          ? prev.map((avail) => (avail.id === availability.id ? availability : avail))
          : [...prev, availability]
      );
    }
  };

  const visibleAvailabilities = availabilities.filter(
    (item) =>
      isWithinInterval(item.start, { start: calendarStart, end: calendarEnd }) ||
      isWithinInterval(item.end, { start: calendarStart, end: calendarEnd })
  );
  const visibleBookedSessions = bookedSessions.filter(
    (item) =>
      isWithinInterval(item.start, { start: calendarStart, end: calendarEnd }) ||
      isWithinInterval(item.end, { start: calendarStart, end: calendarEnd })
  );

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showMoreDialogOpen, setShowMoreDialogOpen] = useState(false);

  // Create 5 rows × 7 columns grid
  const createCalendarGrid = () => {
    const rows = [];
    for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < 7; colIndex++) {
        const dayIndex = rowIndex * 7 + colIndex;
        if (dayIndex < calendarDays.length) {
          row.push(calendarDays[dayIndex]);
        }
      }
      rows.push(row);
    }
    return rows;
  };

  const calendarGrid = createCalendarGrid();

  return (
    <div className="h-screen w-full bg-gray-900/50 overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col bg-gray-800/80 shadow-lg min-h-0">
        {/* Days Header Row */}
        <div className="flex border-b border-gray-700 bg-gray-700/50 h-10 flex-shrink-0">
          {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
            <div key={day} className="flex-1 py-2 text-center text-base font-semibold text-gray-300 border-r border-gray-700 last:border-r-0 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Scrollable Calendar Grid - 5 Rows */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-800/50
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-900/50
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb:hover]:bg-gray-900/70
            [&::-webkit-scrollbar-corner]:bg-gray-800/50"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(17 24 39 / 0.5) rgb(31 41 55 / 0.5)'
          }}
        >
          <div className="min-h-full flex flex-col">
            {calendarGrid.map((row, rowIndex) => (
              <div 
                key={rowIndex} 
                className="flex border-b border-gray-700/50 last:border-b-0" 
                style={{ 
                  minHeight: '120px', 
                  height: 'auto'
                }}
              >
                {row.map((calDate, colIndex) => {
                  if (!calDate) {
                    return <div key={`empty-${colIndex}`} className="flex-1 border-r border-gray-700/50 last:border-r-0"></div>;
                  }

                  const dayAvailabilities = visibleAvailabilities.filter((item) =>
                    isSameDay(item.start, calDate)
                  );
                  const dayBookedSessions = visibleBookedSessions.filter((item) =>
                    isSameDay(item.start, calDate)
                  );
                  const allEntries = [...dayAvailabilities, ...dayBookedSessions];
                  const displayedEntries = allEntries.slice(0, 2); 
                  const hasMore = allEntries.length > 2;

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "flex-1 border-r border-gray-700/50 last:border-r-0 p-1 transition-colors duration-200 relative flex flex-col",
                        isWithinInterval(calDate, { start: monthStart, end: monthEnd })
                          ? "bg-gray-800 hover:bg-gray-700/80"
                          : "bg-gray-700/30 text-gray-400"
                      )}
                    >
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-1 flex-shrink-0">
                        <span
                          className={cn(
                            "text-sm font-bold px-2 py-1 rounded min-w-[28px] min-h-[28px] flex items-center justify-center",
                            isSameDay(today, calDate) 
                              ? "text-white bg-orange-500" 
                              : isWithinInterval(calDate, { start: monthStart, end: monthEnd })
                              ? "text-white bg-gray-700/60"
                              : "text-gray-500 bg-gray-600/40"
                          )}
                        >
                          {calDate.getDate()}
                        </span>
                        {hasMore && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="px-1.5 py-1 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 transition-colors duration-200 h-auto min-h-0 font-semibold"
                                variant="ghost"
                                onClick={() => setSelectedDay(calDate)}
                                aria-label={`Show ${allEntries.length - 2} more entries for ${format(calDate, "PP")}`}
                              >
                                +{allEntries.length - 2}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 text-white max-w-lg rounded-xl shadow-lg border border-gray-700 max-h-[80vh]">
                              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
                                <DialogTitle className="text-xl font-bold text-orange-400">
                                  {format(calDate, "PP")} - All Times
                                </DialogTitle>
                              </div>
                              
                              <div className="overflow-y-auto px-6 pb-6 space-y-4 max-h-[60vh] 
                                [&::-webkit-scrollbar]:w-1 
                                [&::-webkit-scrollbar-track]:bg-gray-700/50 
                                [&::-webkit-scrollbar-thumb]:bg-gray-900/50 
                                [&::-webkit-scrollbar-thumb]:rounded-full 
                                [&::-webkit-scrollbar-thumb:hover]:bg-gray-800">
                                {allEntries.map((item, i) => {
                                  const isAvailability = "booked" in item;
                                  const isBookedSession = !isAvailability;
                                  const fallbackAvailability: AvalabilityType = isBookedSession
                                    ? {
                                        id: undefined,
                                        start: item.start instanceof Date ? item.start : new Date(item.start),
                                        end: item.end instanceof Date ? item.end : new Date(item.end),
                                        booked: [],
                                        medium: [item.medium || "offline"],
                                      }
                                    : (item as AvalabilityType);

                                  return (
                                    <div key={i} className="border border-gray-700 p-4 rounded-lg bg-gray-900/50">
                                      <div className="flex items-center justify-between mb-3">
                                        <span
                                          className={cn(
                                            "px-3 py-1.5 text-sm rounded-lg font-medium",
                                            isAvailability
                                              ? Array.isArray(item.booked) && item.booked.length > 0
                                                ? "bg-orange-500 text-white"
                                                : "bg-transparent border border-orange-400 text-orange-400"
                                              : isBefore(item.start, startOfToday())
                                              ? "bg-gray-600 text-gray-300"
                                              : "bg-green-500 text-white"
                                          )}
                                        >
                                          {format(item.start, "p")} - {format(item.end, "p")}
                                        </span>
                                      </div>
                                      <SessionDetailsSheet
                                        bookedSession={
                                          isAvailability && Array.isArray(item.booked) && item.booked.length > 0
                                            ? {
                                                session_type: "1:1",
                                                sessionId: typeof item.booked === "string" ? item.booked : "",
                                                start: item.start,
                                                end: item.end,
                                                medium: "offline",
                                              }
                                            : isBookedSession
                                            ? item
                                            : null
                                        }
                                        availability={fallbackAvailability}
                                        updateAvailabilities={handleUpdateAvailabilities}
                                        availabilityState={{
                                          values: availabilities,
                                          onChange: handleUpdateAvailabilities,
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {/* Entries Container */}
                      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {displayedEntries.map((item, i) => {
                          const isAvailability = "booked" in item;
                          const isBookedSession = !isAvailability;
                          const fallbackAvailability: AvalabilityType = isBookedSession
                            ? {
                                id: undefined,
                                start: item.start instanceof Date ? item.start : new Date(item.start),
                                end: item.end instanceof Date ? item.end : new Date(item.end),
                                booked: [],
                                medium: [item.medium || "offline"],
                              }
                            : (item as AvalabilityType);

                          return (
                            <Sheet key={i}>
                              <SheetTrigger asChild>
                                <button
                                  className={cn(
                                    "w-full px-1.5 py-1 text-sm rounded transition-all duration-200 text-left h-6 flex items-center",
                                    isAvailability
                                      ? Array.isArray(item.booked) && item.booked.length > 0
                                        ? "bg-orange-500 text-white hover:bg-orange-600"
                                        : "bg-transparent border border-orange-400 text-orange-400 hover:bg-orange-400/10"
                                      : isBefore(item.start, startOfToday())
                                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                      : "bg-green-500 text-white hover:bg-green-600"
                                  )}
                                >
                                  <div className="truncate text-sm">
                                    {format(item.start, "p")} - {format(item.end, "p")}
                                  </div>
                                </button>
                              </SheetTrigger>
                              <SheetContent className="px-4 bg-gray-800 rounded-l-xl border-l border-gray-700">
                                <SheetTitle className="p-5"></SheetTitle>
                                <SessionDetailsSheet
                                  bookedSession={
                                    isAvailability && Array.isArray(item.booked) && item.booked.length > 0
                                      ? {
                                          session_type: "1:1",
                                          sessionId: typeof item.booked === "string" ? item.booked : "",
                                          start: item.start,
                                          end: item.end,
                                          medium: "offline",
                                        }
                                      : isBookedSession
                                      ? item
                                      : null
                                  }
                                  availability={fallbackAvailability}
                                  updateAvailabilities={handleUpdateAvailabilities}
                                  availabilityState={{
                                    values: availabilities,
                                    onChange: handleUpdateAvailabilities,
                                  }}
                                />
                              </SheetContent>
                            </Sheet>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}










// "use client";
// import React, { useState, useEffect } from "react";
// import { useCalendarContext } from "./CalendarContext";
// import {
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameDay,
//   format,
//   isWithinInterval,
//   isBefore,
//   startOfToday,
// } from "date-fns";
// import { cn } from "@/lib/utils";
// import { AvalabilityType, BookedSessionType } from "@/app/types";
// import {
//   Sheet,
//   SheetContent,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import SessionDetailsSheet from "./SessionDetailsSheet";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";

// type Props = {
//   availabilities?: AvalabilityType[];
//   bookedSessions?: BookedSessionType[];
// };

// export default function CalendarUI({ availabilities: initialAvailabilities = [], bookedSessions = [] }: Props) {
//   const { date } = useCalendarContext();
//   const [availabilities, setAvailabilities] = useState<AvalabilityType[]>(initialAvailabilities);

//   const monthStart = startOfMonth(date);
//   const monthEnd = endOfMonth(date);
//   const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 });
//   const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });
//   const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
//   const today = new Date();

//   useEffect(() => {
//     setAvailabilities(initialAvailabilities);
//   }, [initialAvailabilities]);

//   const handleUpdateAvailabilities = (availability: AvalabilityType, isDelete?: boolean) => {
//     if (isDelete) {
//       setAvailabilities((prev) => prev.filter((avail) => avail.id !== availability.id));
//     } else {
//       setAvailabilities((prev) =>
//         prev.some((avail) => avail.id === availability.id)
//           ? prev.map((avail) => (avail.id === availability.id ? availability : avail))
//           : [...prev, availability]
//       );
//     }
//   };

//   const visibleAvailabilities = availabilities.filter(
//     (item) =>
//       isWithinInterval(item.start, { start: calendarStart, end: calendarEnd }) ||
//       isWithinInterval(item.end, { start: calendarStart, end: calendarEnd })
//   );
//   const visibleBookedSessions = bookedSessions.filter(
//     (item) =>
//       isWithinInterval(item.start, { start: calendarStart, end: calendarEnd }) ||
//       isWithinInterval(item.end, { start: calendarStart, end: calendarEnd })
//   );

//   const [selectedDay, setSelectedDay] = useState<Date | null>(null);
//   const [showMoreDialogOpen, setShowMoreDialogOpen] = useState(false);

//   // Create 5 rows × 7 columns grid
//   const createCalendarGrid = () => {
//     const rows = [];
//     for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
//       const row = [];
//       for (let colIndex = 0; colIndex < 7; colIndex++) {
//         const dayIndex = rowIndex * 7 + colIndex;
//         if (dayIndex < calendarDays.length) {
//           row.push(calendarDays[dayIndex]);
//         }
//       }
//       rows.push(row);
//     }
//     return rows;
//   };

//   const calendarGrid = createCalendarGrid();

//   return (
//     <div className="h-screen w-full bg-gray-900/50 overflow-hidden flex flex-col">
//       <div className="flex-1 flex flex-col bg-gray-800/80 shadow-lg min-h-0">
//         {/* Days Header Row */}
//         <div className="flex border-b border-gray-700 bg-gray-700/50 h-10 flex-shrink-0">
//           {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
//             <div key={day} className="flex-1 py-2 text-center text-base font-semibold text-gray-300 border-r border-gray-700 last:border-r-0 flex items-center justify-center">
//               {day}
//             </div>
//           ))}
//         </div>

//         {/* Scrollable Calendar Grid - 5 Rows */}
//         <div 
//           className="flex-1 overflow-y-auto overflow-x-hidden
//             [&::-webkit-scrollbar]:w-2
//             [&::-webkit-scrollbar-track]:bg-gray-800/50
//             [&::-webkit-scrollbar-track]:rounded-full
//             [&::-webkit-scrollbar-thumb]:bg-gray-900/50
//             [&::-webkit-scrollbar-thumb]:rounded-full
//             [&::-webkit-scrollbar-thumb:hover]:bg-gray-900/70
//             [&::-webkit-scrollbar-corner]:bg-gray-800/50"
//           style={{ 
//             scrollbarWidth: 'thin',
//             scrollbarColor: 'rgb(17 24 39 / 0.5) rgb(31 41 55 / 0.5)'
//           }}
//         >
//           <div className="min-h-full flex flex-col">
//             {calendarGrid.map((row, rowIndex) => (
//               <div 
//                 key={rowIndex} 
//                 className="flex border-b border-gray-700/50 last:border-b-0" 
//                 style={{ 
//                   minHeight: '120px', 
//                   height: 'auto'
//                 }}
//               >
//                 {row.map((calDate, colIndex) => {
//                   if (!calDate) {
//                     return <div key={`empty-${colIndex}`} className="flex-1 border-r border-gray-700/50 last:border-r-0"></div>;
//                   }

//                   const dayAvailabilities = visibleAvailabilities.filter((item) =>
//                     isSameDay(item.start, calDate)
//                   );
//                   const dayBookedSessions = visibleBookedSessions.filter((item) =>
//                     isSameDay(item.start, calDate)
//                   );
//                   const allEntries = [...dayAvailabilities, ...dayBookedSessions];
//                   const displayedEntries = allEntries.slice(0, 2); // Show only first 2 entries
//                   const hasMore = allEntries.length > 2; // Show count if more than 2 entries

//                   return (
//                     <div
//                       key={`${rowIndex}-${colIndex}`}
//                       className={cn(
//                         "flex-1 border-r border-gray-700/50 last:border-r-0 p-1 transition-colors duration-200 relative flex flex-col",
//                         isWithinInterval(calDate, { start: monthStart, end: monthEnd })
//                           ? "bg-gray-800 hover:bg-gray-700/80"
//                           : "bg-gray-700/30 text-gray-400"
//                       )}
//                     >
//                       {/* Date Header */}
//                       <div className="flex items-center justify-between mb-1 flex-shrink-0">
//                         <span
//                           className={cn(
//                             "text-sm font-bold px-2 py-1 rounded min-w-[28px] min-h-[28px] flex items-center justify-center",
//                             isSameDay(today, calDate) 
//                               ? "text-white bg-orange-500" 
//                               : isWithinInterval(calDate, { start: monthStart, end: monthEnd })
//                               ? "text-white bg-gray-700/60"
//                               : "text-gray-500 bg-gray-600/40"
//                           )}
//                         >
//                           {calDate.getDate()}
//                         </span>
//                         {hasMore && (
//                           <Dialog>
//                             <DialogTrigger asChild>
//                               <Button
//                                 className="px-1.5 py-1 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 transition-colors duration-200 h-auto min-h-0 font-semibold"
//                                 variant="ghost"
//                                 onClick={() => setSelectedDay(calDate)}
//                                 aria-label={`Show ${allEntries.length - 2} more entries for ${format(calDate, "PP")}`}
//                               >
//                                 +{allEntries.length - 2}
//                               </Button>
//                             </DialogTrigger>
//                             <DialogContent className="bg-gray-800 text-white max-w-lg rounded-xl shadow-lg border border-gray-700 max-h-[80vh]">
//                               <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
//                                 <DialogTitle className="text-xl font-bold text-orange-400">
//                                   {format(calDate, "PP")} - All Times
//                                 </DialogTitle>
//                               </div>
                              
//                               <div className="overflow-y-auto px-6 pb-6 space-y-4 max-h-[60vh] 
//                                 [&::-webkit-scrollbar]:w-1 
//                                 [&::-webkit-scrollbar-track]:bg-gray-700/50 
//                                 [&::-webkit-scrollbar-thumb]:bg-gray-900/50 
//                                 [&::-webkit-scrollbar-thumb]:rounded-full 
//                                 [&::-webkit-scrollbar-thumb:hover]:bg-gray-800">
//                                 {allEntries.map((item, i) => {
//                                   const isAvailability = "booked" in item;
//                                   const isBookedSession = !isAvailability;
//                                   const fallbackAvailability: AvalabilityType = isBookedSession
//                                     ? {
//                                         id: undefined,
//                                         start: item.start,
//                                         end: item.end,
//                                         booked: false,
//                                         medium: [item.medium || "offline"],
//                                       }
//                                     : (item as AvalabilityType);

//                                   return (
//                                     <div key={i} className="border border-gray-700 p-4 rounded-lg bg-gray-900/50">
//                                       <div className="flex items-center justify-between mb-3">
//                                         <span
//                                           className={cn(
//                                             "px-3 py-1.5 text-sm rounded-lg font-medium",
//                                             isAvailability
//                                               ? Array.isArray(item.booked) && item.booked.length > 0
//                                                 ? "bg-orange-500 text-white"
//                                                 : "bg-transparent border border-orange-400 text-orange-400"
//                                               : isBefore(item.start, startOfToday())
//                                               ? "bg-gray-600 text-gray-300"
//                                               : "bg-green-500 text-white"
//                                           )}
//                                         >
//                                           {format(item.start, "p")} - {format(item.end, "p")}
//                                         </span>
//                                       </div>
//                                       <SessionDetailsSheet
//                                         bookedSession={
//                                           isAvailability && Array.isArray(item.booked) && item.booked.length > 0
//                                             ? {
//                                                 session_type: "1:1",
//                                                 sessionId: typeof item.booked === "string" ? item.booked : "",
//                                                 start: item.start,
//                                                 end: item.end,
//                                                 medium: "offline",
//                                               }
//                                             : isBookedSession
//                                             ? item
//                                             : null
//                                         }
//                                         availability={fallbackAvailability}
//                                         updateAvailabilities={handleUpdateAvailabilities}
//                                         availabilityState={{
//                                           values: availabilities,
//                                           onChange: handleUpdateAvailabilities,
//                                         }}
//                                       />
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </DialogContent>
//                           </Dialog>
//                         )}
//                       </div>

//                       {/* Entries Container */}
//                       <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
//                         {displayedEntries.map((item, i) => {
//                           const isAvailability = "booked" in item;
//                           const isBookedSession = !isAvailability;
//                           const fallbackAvailability: AvalabilityType = isBookedSession
//                             ? {
//                                 id: undefined,
//                                 start: item.start,
//                                 end: item.end,
//                                 booked: false,
//                                 medium: [item.medium || "offline"],
//                               }
//                             : (item as AvalabilityType);

//                           return (
//                             <Sheet key={i}>
//                               <SheetTrigger asChild>
//                                 <button
//                                   className={cn(
//                                     "w-full px-1.5 py-1 text-sm rounded transition-all duration-200 text-left h-6 flex items-center",
//                                     isAvailability
//                                       ? Array.isArray(item.booked) && item.booked.length > 0
//                                         ? "bg-orange-500 text-white hover:bg-orange-600"
//                                         : "bg-transparent border border-orange-400 text-orange-400 hover:bg-orange-400/10"
//                                       : isBefore(item.start, startOfToday())
//                                       ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
//                                       : "bg-green-500 text-white hover:bg-green-600"
//                                   )}
//                                 >
//                                   <div className="truncate text-sm">
//                                     {format(item.start, "p")} - {format(item.end, "p")}
//                                   </div>
//                                 </button>
//                               </SheetTrigger>
//                               <SheetContent className="px-4 bg-gray-800 rounded-l-xl border-l border-gray-700">
//                                 <SheetTitle className="p-5"></SheetTitle>
//                                 <SessionDetailsSheet
//                                   bookedSession={
//                                     isAvailability && Array.isArray(item.booked) && item.booked.length > 0
//                                       ? {
//                                           session_type: "1:1",
//                                           sessionId: typeof item.booked === "string" ? item.booked : "",
//                                           start: item.start,
//                                           end: item.end,
//                                           medium: "offline",
//                                         }
//                                       : isBookedSession
//                                       ? item
//                                       : null
//                                   }
//                                   availability={fallbackAvailability}
//                                   updateAvailabilities={handleUpdateAvailabilities}
//                                   availabilityState={{
//                                     values: availabilities,
//                                     onChange: handleUpdateAvailabilities,
//                                   }}
//                                 />
//                               </SheetContent>
//                             </Sheet>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }