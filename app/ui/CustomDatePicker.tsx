"use client";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const monthMap = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
type Props = {
  dateValue: Date;
  onDateChange: (date: Date | undefined) => void;
  startYear: number;
  yearCount: number;
};
function CustomDatePicker({
  startYear,
  yearCount,
  dateValue,
  onDateChange,
}: Props) {
  const [year, setYear] = React.useState<number>(2000);
  const [month, setMonth] = React.useState<number>(1);

  //   const handleDayPickerSelect = (date: Date | undefined) => {
  //     if (!date) {
  //       setSelectedDate(undefined);
  //     } else {
  //       setMonth(date.getMonth());
  //       setYear(date.getFullYear());
  //       setSelectedDate(date);
  //     }
  //   };
  const handleMonthChange = (month: Date) => {
    setMonth(month.getMonth());
  };
  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-y-4 p-3">
        <Select onValueChange={(value) => setYear(parseInt(value))}>
          <SelectTrigger className="w-[180px] cursor-pointer ">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: yearCount }, (_, i) => (
              <SelectItem key={i} value={(startYear + i).toString()}>
                {startYear + i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setMonth(parseInt(value))}>
          <SelectTrigger className="w-[180px] cursor-pointer ">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {monthMap[i]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Calendar
        mode="single"
        month={new Date(year, month, 1)}
        onMonthChange={handleMonthChange}
        selected={dateValue}
        onSelect={onDateChange}
        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
        initialFocus
        className="w-full"
      />
    </div>
  );
}

export default CustomDatePicker;
