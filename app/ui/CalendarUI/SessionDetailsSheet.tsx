// "use client";
// import { getSessionBySessionID } from "@/app/lib/fetchers/sessions";
// import {
//   AvalabilityType,
//   BookedSessionType,
//   SessionInfoType,
// } from "@/app/types";
// import { cn } from "@/lib/utils";
// import { format, intervalToDuration } from "date-fns";
// import Image from "next/image";
// import React, { useEffect } from "react";
// import { Trash } from "lucide-react";
// import { deleteAvailability } from "@/app/lib/mutations/mentor";
// import { toast } from "sonner";

// type Props = {
//   bookedSession: BookedSessionType | null;
//   availability: AvalabilityType;
//   updateAvailabilities: (avail: AvalabilityType) => void;
// };

// const SessionDetailsSheet = ({
//   bookedSession,
//   availability,
//   updateAvailabilities,
// }: Props) => {
//   const [sessionDetails, setSessionDetails] =
//     React.useState<SessionInfoType | null>(null);

//   const handleDeleteAvail = async () => {
//     const res = await deleteAvailability(availability);
//     if (res) {
//       updateAvailabilities(availability);
//       toast.success("Availability Deleted");
//     } else {
//       toast.error("Failed Deleting Availability");
//     }
//   };
//   let duration;
//   if (!bookedSession) {
//     duration = intervalToDuration({
//       start: availability.start,
//       end: availability.end,
//     });
//   } else {
//     duration = intervalToDuration({
//       start: bookedSession.start,
//       end: bookedSession.end,
//     });
//   }

//   useEffect(() => {
//     const fn = async () => {
//       if (bookedSession) {
//         const data: SessionInfoType = await getSessionBySessionID(
//           bookedSession.sessionId,
//         );
//         setSessionDetails(data);
//       }
//     };
//     fn();
//   }, []);

//   return (
//     <div>
//       {sessionDetails && bookedSession && (
//         <div className="flex flex-col ">
//           <span className="text-xl font-semibold my-2">
//             {format(bookedSession.start, "PP")}
//           </span>
//           <div className="py-1 my-1">
//             <span className="bg-orange-800 rounded-lg px-2">
//               {duration.years && <span>{duration.years} years</span>}
//               {duration.months && <span>{duration.months} months</span>}
//               {duration.days && <span>{duration.days} days</span>}
//               {duration.hours && (
//                 <span>
//                   {duration.hours} {duration.hours > 1 ? "hours " : "hour "}
//                 </span>
//               )}

//               {duration.minutes && <span>{duration.minutes} minutes</span>}
//             </span>
//           </div>
//           <span
//             className={cn(
//               "w-[200px] flex justify-center px-2 rounded-lg",
//               "bg-green-900 text-green-500",
//             )}
//           >
//             {format(bookedSession.start, "p")} to{" "}
//             {format(bookedSession.end, "p")}
//           </span>
//           <span className="font-semibold text-4xl">{sessionDetails.title}</span>
//           <span className="bg-orange-800 px-2 py-1 rounded-md my-2 ">
//             {sessionDetails.type}
//           </span>
//           <span className="flex my-2  items-center gap-x-2">
//             <Image
//               src={sessionDetails.mentorImageLink ?? "/default-mentor.png"}
//               alt="Mentor"
//               width={40}
//               height={40}
//               className="rounded-full mr-2 border-2 border-white"
//             />
//             <span className="flex flex-col font-semibold">
//               <span className="text-sm">Mentor</span>
//               <span className="text-xl">{sessionDetails.mentorName}</span>
//             </span>
//           </span>
//           {/* <span className="flex gap-x-2 my-2"> */}
//           {/*   {sessionDetails.session_medium.map((item, i) => { */}
//           {/*     return ( */}
//           {/*       <span key={i} className="bg-gray-600 px-2 rounded-md"> */}
//           {/*         {item} */}
//           {/*       </span> */}
//           {/*     ); */}
//           {/*   })} */}
//           {/* </span> */}
//           <span className="text-gray-500/80 font-semibold">Description</span>
//           <span>{sessionDetails.Description}</span>
//           <div className="my-8 flex flex-col">
//             <span className="text-3xl font-semibold">Appointment Details</span>
//             <div className="my-3">
//               <span className="bg-orange-800 px-2 rounded-xl">
//                 {bookedSession.medium}
//               </span>
//             </div>
//             {bookedSession.medium === "online" && (
//               <div className="flex flex-col">
//                 <span className="text-xl">Meeting Link</span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       {!bookedSession && (
//         <div className="flex flex-col">
//           <span className="text-3xl">Availability</span>
//           <div>
//             <span className="bg-orange-800 rounded-lg px-2">
//               {duration.years && <span>{duration.years} years</span>}
//               {duration.months && <span>{duration.months} months</span>}
//               {duration.days && <span>{duration.days} days</span>}
//               {duration.hours && (
//                 <span>
//                   {duration.hours} {duration.hours > 1 ? "hours " : "hour "}
//                 </span>
//               )}

//               {duration.minutes && <span>{duration.minutes} minutes</span>}
//             </span>
//             <span>
//               {availability.medium.map((m) => {
//                 return (
//                   <span
//                     key={m}
//                     className="mx-2 bg-orange-800 rounded-full px-2"
//                   >
//                     {m}
//                   </span>
//                 );
//               })}
//             </span>
//           </div>
//           <div className="flex gap-x-2 items-center">
//             <span>from </span>
//             <span className="w-[10px] h-[10px] bg-orange-500 rounded-full"></span>
//             <span>{format(availability.start, "PPp")}</span>
//           </div>
//           <div className="flex gap-x-2 items-center">
//             <span>to </span>
//             <span className="w-[10px] h-[10px] bg-indigo-500 rounded-full"></span>
//             <span>{format(availability.end, "PPp")}</span>
//           </div>
//           <div>
//             <span
//               className="flex gap-x-2 py-1 my-5 bg-red-500 w-[100px] items-center justify-center rounded-lg hover:opacity-70"
//               onClick={handleDeleteAvail}
//             >
//               Delete <Trash height={20} width={20} />
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SessionDetailsSheet;


// -------------- above code written by rafi -------------------



"use client";
import { getSessionBySessionID } from "@/app/lib/fetchers/sessions";
import { AvalabilityType, BookedSessionType, SessionInfoType } from "@/app/types";
import { cn } from "@/lib/utils";
import { format, intervalToDuration, isBefore, isSameDay, isWithinInterval, addMinutes } from "date-fns";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Trash, Pencil } from "lucide-react";
import { deleteAvailability, updateAvailability } from "@/app/lib/mutations/mentor";
import { toast } from "sonner";
import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { hover_style, smooth_hover } from "@/app/ui/CustomStyles";

type Props = {
  bookedSession?: BookedSessionType | null;
  availability: AvalabilityType;
  updateAvailabilities?: (avail: AvalabilityType, isDelete?: boolean) => void;
  availabilityState?: { values: AvalabilityType[]; onChange: (val: AvalabilityType) => void };
};

const SessionDetailsSheet = ({ bookedSession, availability, updateAvailabilities, availabilityState }: Props) => {
  const [sessionDetails, setSessionDetails] = useState<SessionInfoType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStartTime, setEditStartTime] = useState<Date>(availability.start);
  const [editEndTime, setEditEndTime] = useState<Date | null>(availability.end);
  const [editMedium, setEditMedium] = useState<("online" | "offline")[]>(availability.medium || ["online"]);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Calculate initial duration in minutes
  const initialDuration = Math.round((availability.end.getTime() - availability.start.getTime()) / (1000 * 60));

  // Validate form inputs
  useEffect(() => {
    const now = new Date();
    const isStartValid = isBefore(now, editStartTime);
    const isEndValid = editEndTime && isSameDay(editStartTime, editEndTime) && isBefore(editStartTime, editEndTime);
    const isMediumValid = editMedium.length > 0;

    // Check for overlaps (excluding the current availability)
    const hasOverlap = availabilityState?.values.some((avail) =>
      avail.id !== availability.id && (
        isWithinInterval(editStartTime, { start: avail.start, end: avail.end }) ||
        isWithinInterval(editEndTime || editStartTime, { start: avail.start, end: avail.end }) ||
        (isBefore(avail.start, editEndTime || editStartTime) && isBefore(editStartTime, avail.end))
      )
    ) || false;

    if (!isStartValid) {
      setError("Start time must be in the future.");
    } else if (!isEndValid) {
      setError("End time must be on the same day and after start time.");
    } else if (!isMediumValid) {
      setError("At least one medium (online/offline) must be selected.");
    } else if (hasOverlap) {
      setError("This time slot overlaps with an existing availability.");
    } else {
      setError(null);
    }

    setIsValid(isStartValid && Boolean(isEndValid) && isMediumValid && !hasOverlap);
  }, [editStartTime, editEndTime, editMedium, availabilityState?.values, availability.id]);

  const handleDeleteAvail = async () => {
    if (!updateAvailabilities) return;
    console.log('Deleting availability:', availability);
    const res = await deleteAvailability(availability);
    if (res) {
      updateAvailabilities(availability, true);
      toast.success("Availability Deleted");
    } else {
      toast.error("Failed Deleting Availability");
    }
  };

  const handleEditSubmit = async () => {
    if (!updateAvailabilities || !isValid || !editEndTime) return;

    const updatedAvailability: AvalabilityType = {
      ...availability,
      start: editStartTime,
      end: editEndTime,
      medium: editMedium,
    };

    try {
      const result = await updateAvailability(updatedAvailability);
      console.log('Updated availability:', result);
      updateAvailabilities(result);
      toast.success("Availability Updated Successfully");
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.error("Failed Updating Availability");
    }
  };

  const duration = intervalToDuration({
    start: bookedSession ? bookedSession.start : availability.start,
    end: bookedSession ? bookedSession.end : availability.end,
  });

  useEffect(() => {
    const fn = async () => {
      if (bookedSession) {
        const data: SessionInfoType = await getSessionBySessionID(bookedSession.sessionId);
        setSessionDetails(data);
      }
    };
    fn();
  }, [bookedSession]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 bg-gray-800 text-white rounded-xl">
      {sessionDetails && bookedSession && (
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold text-orange-400">{format(bookedSession.start, "PP")}</span>
          <div className="py-1">
            <span className="bg-orange-500 rounded-lg px-3 py-1.5 text-sm font-semibold">
              {duration.hours && `${duration.hours} ${duration.hours > 1 ? "hours" : "hour"} `}
              {duration.minutes && `${duration.minutes} minutes`}
            </span>
          </div>
          <span className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
            {format(bookedSession.start, "p")} - {format(bookedSession.end, "p")}
          </span>
          <span className="text-2xl font-bold truncate text-white">{sessionDetails.title}</span>
          <span className="bg-orange-500 px-3 py-1.5 rounded-lg text-sm font-semibold">{sessionDetails.type}</span>
          <span className="flex items-center gap-x-3">
            <Image
              src={sessionDetails.mentorImageLink ?? "/default-mentor.png"}
              alt="Mentor"
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-600"
            />
            <span className="flex flex-col">
              <span className="text-xs text-gray-300">Mentor</span>
              <span className="text-base font-semibold text-white">{sessionDetails.mentorName}</span>
            </span>
          </span>
          <span className="text-gray-300 text-sm font-semibold">Description</span>
          <span className="text-sm text-gray-200 line-clamp-3">{sessionDetails.Description}</span>
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-lg font-semibold text-orange-400">Appointment Details</span>
            <span className="bg-orange-500 px-3 py-1.5 rounded-lg text-sm font-semibold">{bookedSession.medium}</span>
            {bookedSession.medium === "online" && (
              <div className="flex flex-col">
                <span className="text-base text-gray-200">Meeting Link</span>
              </div>
            )}
          </div>
        </div>
      )}
      {!bookedSession && (
        <div className="flex flex-col gap-4">
          <span className="text-2xl font-bold text-orange-400">Availability</span>
          <div className="flex flex-col gap-2">
            <span className="bg-orange-500 rounded-lg px-3 py-1.5 text-sm font-semibold">
              {duration.hours && `${duration.hours} ${duration.hours > 1 ? "hours" : "hour"} `}
              {duration.minutes && `${duration.minutes} minutes`}
            </span>
            <span className="flex gap-2">
              {Array.isArray(availability.medium) && availability.medium.length > 0 ? (
                availability.medium.map((m) => (
                  <span key={m} className="bg-orange-500 rounded-full px-3 py-1.5 text-sm font-semibold">{m}</span>
                ))
              ) : (
                <span className="text-sm text-gray-300">No medium specified</span>
              )}
            </span>
          </div>
          <div className="flex gap-x-2 items-center text-sm text-gray-200">
            <span>from</span>
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            <span>{format(availability.start, "PPp")}</span>
          </div>
          <div className="flex gap-x-2 items-center text-sm text-gray-200">
            <span>to</span>
            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
            <span>{format(availability.end, "PPp")}</span>
          </div>
          {updateAvailabilities && (
            <div className="flex gap-3 mt-4">
              <button
                className="flex gap-x-2 py-1.5 bg-red-500 w-[100px] items-center justify-center rounded-lg hover:bg-red-600 text-sm font-semibold shadow-md transition-all duration-200"
                onClick={handleDeleteAvail}
              >
                Delete <Trash className="h-4 w-4" />
              </button>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <button
                    className="flex gap-x-2 py-1.5 bg-blue-500 w-[100px] items-center justify-center rounded-lg hover:bg-blue-600 text-sm font-semibold shadow-md transition-all duration-200"
                  >
                    Edit <Pencil className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white max-w-md p-8 rounded-xl shadow-lg">
                  <DialogTitle className="text-xl font-bold text-orange-400">Edit Availability</DialogTitle>
                  <DialogDescription className="text-sm text-gray-300 mb-4">
                    Update the start time, duration, and medium for your availability.
                  </DialogDescription>
                  {error && (
                    <span className="bg-red-600/90 text-white text-sm font-medium px-4 py-2 rounded-lg mb-4">
                      {error}
                    </span>
                  )}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-gray-200">Start Time</span>
                      <DateTimePicker
                        field={{
                          value: editStartTime,
                          onChange: (val: Date) => {
                            const now = new Date();
                            if (isBefore(now, val)) {
                              setEditStartTime(val);
                            } else {
                              setEditStartTime(addMinutes(now, 5));
                              setError("Start time must be in the future.");
                            }
                          },
                        }}
                        classnames="bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-gray-200">Duration</span>
                      <Select
                        onValueChange={(val) => {
                          const duration = parseInt(val);
                          const newEndTime = addMinutes(editStartTime, duration);
                          setEditEndTime(newEndTime);
                        }}
                        defaultValue={initialDuration.toString()}
                      >
                        <SelectTrigger className="w-full bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500">
                          <SelectValue placeholder="Select Duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-600 rounded-lg">
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="150">2.5 hours</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-gray-200">Available Medium</span>
                      <div className="flex gap-3">
                        <span
                          className={cn(
                            "px-4 py-1.5 text-sm border border-orange-400 rounded-full cursor-pointer transition-all duration-200",
                            editMedium.includes("online") ? "bg-orange-500 text-white" : "text-orange-400",
                            "hover:bg-orange-600 hover:text-white"
                          )}
                          onClick={() =>
                            setEditMedium((prev) =>
                              prev.includes("online")
                                ? prev.filter((item) => item !== "online")
                                : [...prev, "online"]
                            )
                          }
                        >
                          Online
                        </span>
                        <span
                          className={cn(
                            "px-4 py-1.5 text-sm border border-orange-400 rounded-full cursor-pointer transition-all duration-200",
                            editMedium.includes("offline") ? "bg-orange-500 text-white" : "text-orange-400",
                            "hover:bg-orange-600 hover:text-white"
                          )}
                          onClick={() =>
                            setEditMedium((prev) =>
                              prev.includes("offline")
                                ? prev.filter((item) => item !== "offline")
                                : [...prev, "offline"]
                            )
                          }
                        >
                          Offline
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <DialogClose asChild>
                      <Button
                        className="px-6 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-md transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      className={cn(
                        "px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-md",
                        isValid
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                          : "bg-gray-600 cursor-not-allowed"
                      )}
                      onClick={handleEditSubmit}
                      disabled={!isValid}
                    >
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionDetailsSheet;

