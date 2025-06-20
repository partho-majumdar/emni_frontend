"use client";
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  field: { value: Date; onChange: (value: Date) => void };
  classnames?: string;
  timeClock?: "hide";
  year?: boolean;
  placeholder?: string;
}

export function DateTimePicker({ field, classnames, timeClock, year, placeholder }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(field.value);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      field.onChange(newDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
    const newDate = new Date(field.value);
    if (type === "hour") {
      newDate.setHours((parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      const isPM = value === "PM";
      if (isPM && currentHours < 12) newDate.setHours(currentHours + 12);
      else if (!isPM && currentHours >= 12) newDate.setHours(currentHours - 12);
    }
    field.onChange(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <span
          className={cn(
            classnames,
            "flex items-center justify-between text-sm bg-gray-800 p-2 rounded-md",
            !field.value && "text-gray-400"
          )}
        >
          <span className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-orange-500" />
            {field.value ? (
              timeClock !== "hide" ? format(field.value, "PPp") : format(field.value, "PP")
            ) : (
              <span>MM/DD/YYYY hh:mm aa</span>
            )}
          </span>
          {placeholder && <span className="text-gray-400">{placeholder}</span>}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-900">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={handleDateSelect}
            initialFocus
            className="bg-gray-800 text-white"
          />
          <div className="flex flex-col sm:flex-row sm:h-[250px] divide-y sm:divide-y-0 sm:divide-x">
            {timeClock !== "hide" && (
              <ScrollArea className="w-48 sm:w-20">
                <div className="flex sm:flex-col p-1">
                  {hours.map((hour) => (
                    <Button
                      key={hour}
                      size="sm"
                      variant={
                        field.value && field.value.getHours() % 12 === hour % 12 ? "default" : "ghost"
                      }
                      className="sm:w-full h-8 text-xs"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            )}
            {timeClock !== "hide" && (
              <ScrollArea className="w-48 sm:w-20">
                <div className="flex sm:flex-col p-1">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      size="sm"
                      variant={field.value && field.value.getMinutes() === minute ? "default" : "ghost"}
                      className="sm:w-full h-8 text-xs"
                      onClick={() => handleTimeChange("minute", minute.toString())}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            )}
            {timeClock !== "hide" && (
              <ScrollArea className="w-48 sm:w-20">
                <div className="flex sm:flex-col p-1">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="sm"
                      variant={
                        field.value &&
                        ((ampm === "AM" && field.value.getHours() < 12) ||
                          (ampm === "PM" && field.value.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full h-8 text-xs"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
            {year && (
              <ScrollArea className="w-48 sm:w-24">
                <div className="flex sm:flex-col p-1">
                  {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 - i).map(
                    (year) => (
                      <Button
                        key={year}
                        size="sm"
                        variant={field.value && field.value.getFullYear() === year ? "default" : "ghost"}
                        className="sm:w-full h-8 text-xs"
                        onClick={() => {
                          const newDate = new Date(field.value);
                          newDate.setFullYear(year);
                          field.onChange(newDate);
                        }}
                      >
                        {year}
                      </Button>
                    )
                  )}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}