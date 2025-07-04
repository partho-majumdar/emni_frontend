"use client";
import React from "react";
import { useCalendarContext } from "./CalendarContext";
import { getMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CalendarMonthSwitcher = () => {
  const { date, setDate } = useCalendarContext();
  const month = months[getMonth(date)];
  const year = date.getFullYear();

  const goToPreviousMonth = () => setDate(subMonths(date, 1));
  const goToNextMonth = () => setDate(addMonths(date, 1));

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className={cn("flex justify-between w-full max-w-[200px] bg-orange-600 rounded-lg p-2")}>
        <button className="hover:opacity-80 transition-opacity" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <span className="text-base font-medium text-white">{month}</span>
        <button className="hover:opacity-80 transition-opacity" onClick={goToNextMonth}>
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>
      <span className="text-sm font-medium text-gray-300 mt-1">{year}</span>
    </div>
  );
};

export default CalendarMonthSwitcher;