"use client";
import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  startTime: Date;
  durationInMinutes: number;
}

const CountdownTimer = ({ startTime, durationInMinutes }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [status, setStatus] = useState<"Upcoming" | "LIVE" | "Completed" | "Invalid">("Upcoming");

  useEffect(() => {
    if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
      setTimeLeft("Invalid date");
      setStatus("Invalid");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const startTimeMs = startTime.getTime();
      const endTimeMs = startTimeMs + durationInMinutes * 60 * 1000;
      const diffMs = startTimeMs - now.getTime();

      if (now.getTime() < startTimeMs) {
        setStatus("Upcoming");
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;

        setTimeLeft(timeString.trim());
      } else if (now.getTime() >= startTimeMs && now.getTime() <= endTimeMs) {
        setStatus("LIVE");
        setTimeLeft("LIVE");
      } else {
        setStatus("Completed");
        setTimeLeft("Completed");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationInMinutes]);

  return (
    <span className="flex gap-x-2 items-center">
      <Clock size={18} className={status === "LIVE" ? "animate-pulse text-orange-500" : "text-white"} />
      <span className={status === "LIVE" ? "text-orange-500" : status === "Completed" ? "text-gray-500" : "text-white"}>
        {timeLeft}
      </span>
    </span>
  );
};

export default CountdownTimer;