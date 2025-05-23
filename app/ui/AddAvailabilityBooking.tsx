"use client";
import React, { useState } from "react";

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
import { addMinutes, isBefore, isSameDay } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { PopoverContent } from "@/components/ui/popover";
type Props = {
  availabilityState: {
    values: AvalabilityType[];
    onChange: (val: AvalabilityType) => void;
  };
};

const AddAvailabilityBooking = (props: Props) => {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [medium, setMedium] = useState<("online" | "offline")[]>(["online"]);
  const [err, setErr] = useState<string | null>(null);
  const handleAvailabilitySave = async () => {
    // start and end time should be in a single day
    // start time is always less than end time
    if (isSameDay(startTime, endTime) && isBefore(startTime, endTime)) {
      props.availabilityState.onChange({
        start: startTime,
        end: endTime,
        booked: "",
      });
      await addAvailability(startTime, endTime, medium);
    }
  };
  return (
    <Dialog>
      <DialogTrigger>
        <span
          className={cn(
            theme_border,
            hover_style,
            smooth_hover,
            "px-4 cursor-pointer text-lg",
            "hover:opacity:40 z-10",
          )}
        >
          Add Availability
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl">Create Avaliablity</DialogTitle>
        <DialogDescription>
          Select a start time and duration for your availability.
        </DialogDescription>
        <div className="text-lg flex flex-col gap-4">
          <span className="mx-3 font-semibold">Start</span>
          <span className="bg-red-800/60 text-red-300 font-semibold flex justify-center rounded-md">
            {err}
          </span>
          <DateTimePicker
            field={{
              value: startTime,
              onChange: (val: Date) => {
                const nowtime = new Date();
                console.log("val", val.getTime());
                console.log("now", nowtime.getTime());
                if (val.getTime() > nowtime.getTime()) {
                  setStartTime(val);
                  setErr(null);
                } else {
                  setStartTime(addMinutes(nowtime, 1));
                  setErr("Start time should be greater than current time");
                }
              },
            }}
          />
          <span className="mx-3 font-semibold">Duration</span>
          <Select
            onValueChange={(val) => {
              const duration = parseInt(val);
              const newEndTime = new Date(startTime);
              newEndTime.setMinutes(newEndTime.getMinutes() + duration);
              setEndTime(newEndTime);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="150">2.5 hours</SelectItem>
              <SelectItem value="180">3 hours</SelectItem>
            </SelectContent>
          </Select>
          <span>Available </span>
          <div className="flex gap-4 mx-3 select-none">
            <span
              className={cn(
                "border border-orange-500 px-2 rounded-2xl hover:bg-orange-800",
                medium.includes("online") ? "bg-orange-800" : "",
              )}
              onClick={() => {
                if (!medium.includes("online")) {
                  setMedium([...medium, "online"]);
                } else {
                  setMedium(medium.filter((item) => item !== "online"));
                }
              }}
            >
              Online
            </span>
            <span
              className={cn(
                "border border-orange-500 px-2 rounded-2xl hover:bg-orange-800",
                medium.includes("offline") ? "bg-orange-800" : "",
              )}
              onClick={() => {
                if (!medium.includes("offline")) {
                  setMedium([...medium, "offline"]);
                } else {
                  setMedium(medium.filter((item) => item !== "offline"));
                }
              }}
            >
              Offline
            </span>
          </div>
        </div>
        <DialogClose>
          <span
            className={cn(
              theme_border,
              hover_style,
              smooth_hover,
              "px-4 text-lg",
            )}
            onClick={handleAvailabilitySave}
          >
            Save
          </span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddAvailabilityBooking;
