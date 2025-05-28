"use client";
import { GroupSessionInfoType } from "@/app/types";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { updateGroupSession } from "@/app/lib/mutations/mentor";
import EditableField from "@/app/ui/EditableField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/app/ui/LoadingComponent";
import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { isBefore, isSameDay, addMinutes, isWithinInterval } from "date-fns";

type GroupSessionType = {
  id: string; 
  startTime: Date;
  durationInMinutes: number;
};

// Placeholder function to fetch existing group sessions (replace with your actual implementation)
const fetchGroupSessions = async (): Promise<GroupSessionType[]> => {
  // Simulate fetching existing sessions; replace with your API call
  return [];
  // Example: return await yourApi.getGroupSessions();
};

type Props = {
  GroupSessionDetails: GroupSessionInfoType;
  onClose?: () => void;
  onUpdate?: (updatedSession: GroupSessionInfoType) => void;
};

const EditGroupSession = ({ GroupSessionDetails, onClose, onUpdate }: Props) => {
  const [sessionDetails, setSessionDetails] = useState<GroupSessionInfoType>({
    ...GroupSessionDetails,
    startTime:
      GroupSessionDetails.startTime instanceof Date &&
      !isNaN(GroupSessionDetails.startTime.getTime())
        ? GroupSessionDetails.startTime
        : new Date(),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [existingSessions, setExistingSessions] = useState<GroupSessionType[]>([]);

  // Fetch existing group sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await fetchGroupSessions();
        // Exclude the current session from overlap checks
        setExistingSessions(
          sessions.filter((session) => session.id !== GroupSessionDetails.id)
        );
      } catch (error) {
        toast.error("Failed to load existing sessions.");
        console.error(error);
      }
    };
    loadSessions();
  }, [GroupSessionDetails.id]);

  // Validate time and other inputs
  useEffect(() => {
    const now = new Date(); 
    const isStartValid = isBefore(now, sessionDetails.startTime);
    const endTime = addMinutes(
      sessionDetails.startTime,
      sessionDetails.durationInMinutes
    );
    const isEndValid =
      sessionDetails.durationInMinutes > 0 &&
      isSameDay(sessionDetails.startTime, endTime) &&
      isBefore(sessionDetails.startTime, endTime);

    // Check for overlaps with existing sessions
    const hasOverlap = existingSessions.some((session) => {
      const sessionEnd = addMinutes(new Date(session.startTime), session.durationInMinutes);
      return (
        isWithinInterval(sessionDetails.startTime, {
          start: new Date(session.startTime),
          end: sessionEnd,
        }) ||
        isWithinInterval(endTime, {
          start: new Date(session.startTime),
          end: sessionEnd,
        }) ||
        (isBefore(new Date(session.startTime), endTime) &&
          isBefore(sessionDetails.startTime, sessionEnd))
      );
    });

    if (!isStartValid) {
      setError("Start time must be in the future.");
    } else if (!isEndValid) {
      setError("End time must be on the same day and after start time.");
    } else if (hasOverlap) {
      setError("This time slot overlaps with an existing group session.");
    } else {
      setError(null);
    }

    setIsValid(
      Boolean(
        isStartValid &&
        isEndValid &&
        !hasOverlap &&
        sessionDetails.title.trim() &&
        sessionDetails.durationInMinutes > 0 &&
        sessionDetails.participants.max >= 1 &&
        sessionDetails.platform_link.trim()
      )
    );

    // Show error via toast whenever error changes
    if (error) {
      toast.warning(error);
    }
  }, [
    sessionDetails.startTime,
    sessionDetails.durationInMinutes,
    sessionDetails.title,
    sessionDetails.participants.max,
    sessionDetails.platform_link,
    existingSessions,
  ]);

  const validateFields = () => {
    if (!sessionDetails.title.trim()) {
      toast.warning("Session title is required.");
      return false;
    }
    if (!sessionDetails.durationInMinutes) {
      toast.warning("Session duration is required.");
      return false;
    }
    if (
      !(sessionDetails.startTime instanceof Date) ||
      isNaN(sessionDetails.startTime.getTime())
    ) {
      toast.warning("Valid start time is required.");
      return false;
    }
    if (!sessionDetails.participants.max || sessionDetails.participants.max < 1) {
      toast.warning("Maximum participants must be at least 1.");
      return false;
    }
    if (!sessionDetails.platform_link.trim()) {
      toast.warning("Platform link is required.");
      return false;
    }
    if (error) {
      toast.warning(error);
      return false;
    }
    return true;
  };

  const handleUpdateSession = async () => {
    if (!validateFields()) {
      return;
    }
    setLoading(true);
    try {
      console.log("Starting update process for group session:", sessionDetails);
      const res = await updateGroupSession(sessionDetails);
      console.log("Update response received:", res);
      if (res.success) {
        toast.success("Group session updated successfully.");
        setMessage("Group session updated successfully.");
        if (onUpdate) {
          onUpdate({ ...sessionDetails });
        }
        if (onClose) {
          onClose();
        }
      } else {
        console.error("Update failed with error:", res.error);
        toast.error(res.error || "Failed to update group session.");
      }
    } catch (error: any) {
      console.error("Error in handleUpdateSession:", error.message, error.stack);
      toast.error("Error updating group session: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: Date | null) => {
    const now = new Date("2025-05-27T12:22:00+06:00");
    if (value instanceof Date && !isNaN(value.getTime()) && isBefore(now, value)) {
      setSessionDetails({ ...sessionDetails, startTime: value });
    } else {
      setSessionDetails({
        ...sessionDetails,
        startTime: addMinutes(now, 5),
      });
      setError("Start time must be in the future.");
    }
  };

  return (
    <div className="space-y-5">
      <EditableField
        value={sessionDetails.title}
        onChange={(value) => setSessionDetails({ ...sessionDetails, title: value })}
        placeholder="Session Title"
        className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div>
        <textarea
          value={sessionDetails.description}
          onChange={(e) =>
            setSessionDetails({ ...sessionDetails, description: e.target.value })
          }
          placeholder="Description"
          className="w-full h-28 p-3 text-sm text-white bg-gray-800 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="text-sm text-gray-300">Start Time</label>
        <DateTimePicker
          field={{
            value: sessionDetails.startTime,
            onChange: handleDateChange,
          }}
          classnames="w-full text-sm text-white bg-gray-800 border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div className="flex gap-x-3">
        <Select
          onValueChange={(val) => {
            const duration = parseInt(val);
            setSessionDetails({ ...sessionDetails, durationInMinutes: duration });
          }}
          value={sessionDetails.durationInMinutes.toString()}
        >
          <SelectTrigger className="w-32 bg-gray-800 text-white border-gray-700 rounded-md focus:ring-orange-500 text-sm">
            <SelectValue placeholder="Select Duration" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700">
            <SelectItem value="30" className="hover:bg-orange-500/20 text-sm">30 minutes</SelectItem>
            <SelectItem value="60" className="hover:bg-orange-500/20 text-sm">1 hour</SelectItem>
            <SelectItem value="90" className="hover:bg-orange-500/20 text-sm">1.5 hours</SelectItem>
            <SelectItem value="120" className="hover:bg-orange-500/20 text-sm">2 hours</SelectItem>
            <SelectItem value="150" className="hover:bg-orange-500/20 text-sm">2.5 hours</SelectItem>
            <SelectItem value="180" className="hover:bg-orange-500/20 text-sm">3 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <EditableField
        type="number"
        value={sessionDetails.participants.max.toString()}
        onChange={(value) => {
          const val = parseInt(value);
          if (!isNaN(val) && val >= 1) {
            setSessionDetails({
              ...sessionDetails,
              participants: { ...sessionDetails.participants, max: val },
            });
          }
        }}
        placeholder="Max Participants"
        className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-40 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div>
        <EditableField
          value={sessionDetails.platform_link}
          onChange={(value) =>
            setSessionDetails({ ...sessionDetails, platform_link: value })
          }
          placeholder="Platform Link (e.g., Zoom, Google Meet)"
          className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-x-4 mt-2">
          <Link
            href="https://zoom.us/"
            target="_blank"
            className="flex items-center gap-x-1 text-sm text-gray-300 hover:text-orange-500"
          >
            Zoom <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href="https://meet.google.com/"
            target="_blank"
            className="flex items-center gap-x-1 text-sm text-gray-300 hover:text-orange-500"
          >
            Google Meet <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <Button
          className="bg-orange-500 text-white rounded-md px-3 py-1.5 hover:bg-orange-600 transition-colors duration-200 text-sm font-medium"
          onClick={handleUpdateSession}
          disabled={loading || !isValid}
        >
          Update
        </Button>
        {loading && <LoadingSpinner />}
        {message && <div className="text-orange-400 text-xs">{message}</div>}
      </div>
    </div>
  );
};

export default EditGroupSession;