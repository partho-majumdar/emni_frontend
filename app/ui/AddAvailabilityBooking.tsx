// "use client";
// import React, { useState } from "react";

// import { cn } from "@/lib/utils";
// import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
// import { hover_style, smooth_hover, theme_border } from "@/app/ui/CustomStyles";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { DialogClose } from "@radix-ui/react-dialog";
// import { addAvailability } from "../lib/mutations/mentor";
// import { AvalabilityType } from "../types";
// import { addMinutes, isBefore, isSameDay } from "date-fns";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
// import { PopoverContent } from "@/components/ui/popover";
// type Props = {
//   availabilityState: {
//     values: AvalabilityType[];
//     onChange: (val: AvalabilityType) => void;
//   };
// };

// const AddAvailabilityBooking = (props: Props) => {
//   const [startTime, setStartTime] = useState(new Date());
//   const [endTime, setEndTime] = useState(new Date());
//   const [medium, setMedium] = useState<("online" | "offline")[]>(["online"]);
//   const [err, setErr] = useState<string | null>(null);
//   const handleAvailabilitySave = async () => {
//     // start and end time should be in a single day
//     // start time is always less than end time
//     if (isSameDay(startTime, endTime) && isBefore(startTime, endTime)) {
//       props.availabilityState.onChange({
//         start: startTime,
//         end: endTime,
//         booked: "",
//         medium: []
//       });
//       await addAvailability(startTime, endTime, medium);
//     }
//   };
//   return (
//     <Dialog>
//       <DialogTrigger>
//         <span
//           className={cn(
//             theme_border,
//             hover_style,
//             smooth_hover,
//             "px-4 cursor-pointer text-lg",
//             "hover:opacity:40 z-10",
//           )}
//         >
//           Add Availability
//         </span>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogTitle className="text-2xl">Create Availability</DialogTitle>
//         <DialogDescription>
//           Select a start time and duration for your availability.
//         </DialogDescription>
//         <div className="text-lg flex flex-col gap-4">
//           <span className="mx-3 font-semibold">Start</span>
//           <span className="bg-red-800/60 text-red-300 font-semibold flex justify-center rounded-md">
//             {err}
//           </span>
//           <DateTimePicker
//             field={{
//               value: startTime,
//               onChange: (val: Date) => {
//                 const nowtime = new Date();
//                 console.log("val", val.getTime());
//                 console.log("now", nowtime.getTime());
//                 if (val.getTime() > nowtime.getTime()) {
//                   setStartTime(val);
//                   setErr(null);
//                 } else {
//                   setStartTime(addMinutes(nowtime, 1));
//                   setErr("Start time should be greater than current time");
//                 }
//               },
//             }}
//           />
//           <span className="mx-3 font-semibold">Duration</span>
//           <Select
//             onValueChange={(val) => {
//               const duration = parseInt(val);
//               const newEndTime = new Date(startTime);
//               newEndTime.setMinutes(newEndTime.getMinutes() + duration);
//               setEndTime(newEndTime);
//             }}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select Duration" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="30">30 minutes</SelectItem>
//               <SelectItem value="60">1 hour</SelectItem>
//               <SelectItem value="90">1.5 hours</SelectItem>
//               <SelectItem value="120">2 hours</SelectItem>
//               <SelectItem value="150">2.5 hours</SelectItem>
//               <SelectItem value="180">3 hours</SelectItem>
//             </SelectContent>
//           </Select>
//           <span>Available </span>
//           <div className="flex gap-4 mx-3 select-none">
//             <span
//               className={cn(
//                 "border border-orange-500 px-2 rounded-2xl hover:bg-orange-800",
//                 medium.includes("online") ? "bg-orange-800" : "",
//               )}
//               onClick={() => {
//                 if (!medium.includes("online")) {
//                   setMedium([...medium, "online"]);
//                 } else {
//                   setMedium(medium.filter((item) => item !== "online"));
//                 }
//               }}
//             >
//               Online
//             </span>
//             <span
//               className={cn(
//                 "border border-orange-500 px-2 rounded-2xl hover:bg-orange-800",
//                 medium.includes("offline") ? "bg-orange-800" : "",
//               )}
//               onClick={() => {
//                 if (!medium.includes("offline")) {
//                   setMedium([...medium, "offline"]);
//                 } else {
//                   setMedium(medium.filter((item) => item !== "offline"));
//                 }
//               }}
//             >
//               Offline
//             </span>
//           </div>
//         </div>
//         <DialogClose>
//           <span
//             className={cn(
//               theme_border,
//               hover_style,
//               smooth_hover,
//               "px-4 text-lg",
//             )}
//             onClick={handleAvailabilitySave}
//           >
//             Save
//           </span>
//         </DialogClose>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddAvailabilityBooking;


// ------------------- above code written by rafi ---------------------



"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
import { hover_style, smooth_hover, theme_border } from "@/app/ui/CustomStyles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { addAvailability } from "../lib/mutations/mentor";
import { AvalabilityType } from "../types";
import { addMinutes, isBefore, isSameDay, isWithinInterval } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  availabilityState: {
    values: AvalabilityType[];
    onChange: (val: AvalabilityType) => void;
  };
};

const AddAvailabilityBooking = ({ availabilityState }: Props) => {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [medium, setMedium] = useState<("online" | "offline")[]>(["online"]);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Validate form inputs
  useEffect(() => {
    const now = new Date();
    const isStartValid = isBefore(now, startTime);
    const isEndValid = endTime && isSameDay(startTime, endTime) && isBefore(startTime, endTime);
    const isMediumValid = medium.length > 0;

    // Check for overlaps
    const hasOverlap = availabilityState.values.some((avail) =>
      isWithinInterval(startTime, { start: avail.start, end: avail.end }) ||
      isWithinInterval(endTime || startTime, { start: avail.start, end: avail.end }) ||
      (isBefore(avail.start, endTime || startTime) && isBefore(startTime, avail.end))
    );

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
  }, [startTime, endTime, medium, availabilityState.values]);

  const handleAvailabilitySave = async () => {
    if (!isValid || !endTime) return;

    try {
      const newAvailability = await addAvailability(startTime, endTime, medium);
      availabilityState.onChange(newAvailability);
      toast.success("Availability added successfully!");
    } catch (err) {
      toast.error("Failed to add availability. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md",
            hover_style,
            smooth_hover,
            "hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          )}
        >
          Add Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white max-w-md p-8 rounded-xl shadow-lg">
        <DialogTitle className="text-xl font-bold text-orange-400">Create Availability</DialogTitle>
        <DialogDescription className="text-sm text-gray-300 mb-4">
          Select a start time, duration, and medium for your availability.
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
                value: startTime,
                onChange: (val: Date) => {
                  const now = new Date();
                  if (isBefore(now, val)) {
                    setStartTime(val);
                  } else {
                    setStartTime(addMinutes(now, 5));
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
                const newEndTime = addMinutes(startTime, duration);
                setEndTime(newEndTime);
              }}
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
                  medium.includes("online") ? "bg-orange-500 text-white" : "text-orange-400",
                  "hover:bg-orange-600 hover:text-white"
                )}
                onClick={() =>
                  setMedium((prev) =>
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
                  medium.includes("offline") ? "bg-orange-500 text-white" : "text-orange-400",
                  "hover:bg-orange-600 hover:text-white"
                )}
                onClick={() =>
                  setMedium((prev) =>
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
        <DialogClose asChild>
          <Button
            className={cn(
              "mt-6 px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-md",
              isValid
                ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                : "bg-gray-600 cursor-not-allowed"
            )}
            onClick={handleAvailabilitySave}
            disabled={!isValid}
          >
            Save
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddAvailabilityBooking;



