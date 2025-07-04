"use client";
import { createGroupSession } from "@/app/lib/mutations/mentor";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import EditableField from "@/app/ui/EditableField";
import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSpinner from "@/app/ui/LoadingComponent";
import { ExternalLink, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { jakarta } from "@/app/utils/font";
import { isBefore, isSameDay, addMinutes, isWithinInterval } from "date-fns";

type GroupSessionType = {
  startTime: Date;
  durationInMinutes: number;
};

const fetchGroupSessions = async (): Promise<GroupSessionType[]> => {
  return [];
};

const CreateGroupSession = () => {
  const router = useRouter();
  const [groupSessionInfo, setGroupSessionInfo] = useState<{
    title: string;
    description: string;
    startTime: Date;
    durationInMinutes: number;
    maxParticipant: number;
    platform_link: string;
  }>({
    title: "",
    description: "",
    startTime: new Date(),
    durationInMinutes: 60,
    maxParticipant: 25,
    platform_link: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [existingSessions, setExistingSessions] = useState<GroupSessionType[]>([]);

  // Fetch existing group sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await fetchGroupSessions();
        setExistingSessions(sessions);
      } catch (error) {
        toast.error("Failed to load existing sessions.");
        console.error(error);
      }
    };
    loadSessions();
  }, []);

  // Validate time and other inputs
  useEffect(() => {
    const now = new Date(); 
    const isStartValid = isBefore(now, groupSessionInfo.startTime);
    const endTime = addMinutes(groupSessionInfo.startTime, groupSessionInfo.durationInMinutes);
    const isEndValid =
      groupSessionInfo.durationInMinutes > 0 &&
      isSameDay(groupSessionInfo.startTime, endTime) &&
      isBefore(groupSessionInfo.startTime, endTime);

    // Check for overlaps with existing sessions
    const hasOverlap = existingSessions.some((session) => {
      const sessionEnd = addMinutes(new Date(session.startTime), session.durationInMinutes);
      return (
        isWithinInterval(groupSessionInfo.startTime, {
          start: new Date(session.startTime),
          end: sessionEnd,
        }) ||
        isWithinInterval(endTime, {
          start: new Date(session.startTime),
          end: sessionEnd,
        }) ||
        (isBefore(new Date(session.startTime), endTime) &&
          isBefore(groupSessionInfo.startTime, sessionEnd))
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
        groupSessionInfo.title.trim() &&
        groupSessionInfo.durationInMinutes > 0 &&
        groupSessionInfo.maxParticipant >= 1 &&
        groupSessionInfo.platform_link.trim()
      )
    );

    // Show error via toast whenever error changes
    if (error) {
      toast.warning(error);
    }
  }, [
    groupSessionInfo.startTime,
    groupSessionInfo.durationInMinutes,
    groupSessionInfo.title,
    groupSessionInfo.maxParticipant,
    groupSessionInfo.platform_link,
    existingSessions,
  ]);

  const validateFields = () => {
    if (!groupSessionInfo.title.trim()) {
      toast.warning("Session title is required.");
      return false;
    }
    if (!groupSessionInfo.durationInMinutes) {
      toast.warning("Session duration is required.");
      return false;
    }
    if (
      !(groupSessionInfo.startTime instanceof Date) ||
      isNaN(groupSessionInfo.startTime.getTime())
    ) {
      toast.warning("Valid start time is required.");
      return false;
    }
    if (!groupSessionInfo.maxParticipant || groupSessionInfo.maxParticipant < 1) {
      toast.warning("Maximum participants must be at least 1.");
      return false;
    }
    if (!groupSessionInfo.platform_link.trim()) {
      toast.warning("Platform link is required.");
      return false;
    }
    if (error) {
      toast.warning(error);
      return false;
    }
    return true;
  };

  const handleCreateGS = async () => {
    if (!validateFields()) {
      return;
    }
    setLoading(true);
    try {
      const res = await createGroupSession(groupSessionInfo);
      if (res.success) {
        toast.success("Group session created successfully.");
        router.push("/m/group-sessions");
      } else {
        toast.error(res.error || "Failed to create group session.");
      }
    } catch (error) {
      toast.error("Error creating group session.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: Date | null) => {
    const now = new Date("2025-05-27T12:16:00+06:00");
    if (value instanceof Date && !isNaN(value.getTime()) && isBefore(now, value)) {
      setGroupSessionInfo({ ...groupSessionInfo, startTime: value });
    } else {
      setGroupSessionInfo({ ...groupSessionInfo, startTime: addMinutes(now, 5) });
      setError("Start time must be in the future.");
    }
  };

  const handleClose = () => {
    router.push("/m/group-sessions");
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto bg-gray-900/50 p-6 rounded-xl shadow-lg relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-orange-500 focus:outline-none"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <Link href="/m/group-sessions">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-orange-500 mb-4"
          >
            <ChevronLeft className="mr-2" /> Back to Group Sessions
          </Button>
        </Link>
        <h2 className={`${jakarta.className} text-2xl font-bold text-white mb-6`}>Create Group Session</h2>
        <div className="space-y-5">
          <EditableField
            value={groupSessionInfo.title}
            onChange={(value) => setGroupSessionInfo({ ...groupSessionInfo, title: value })}
            placeholder="Session Title"
            className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div>
            <textarea
              value={groupSessionInfo.description}
              onChange={(e) =>
                setGroupSessionInfo({ ...groupSessionInfo, description: e.target.value })
              }
              placeholder="Description"
              className="w-full h-28 p-3 text-sm text-white bg-gray-800 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">Start Time</label>
            <DateTimePicker
              field={{
                value: groupSessionInfo.startTime,
                onChange: handleDateChange,
              }}
              classnames="w-full text-sm text-white bg-gray-800 border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-x-3">
            <Select
              onValueChange={(val) => {
                const duration = parseInt(val);
                setGroupSessionInfo({ ...groupSessionInfo, durationInMinutes: duration });
              }}
              value={groupSessionInfo.durationInMinutes.toString()}
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
            value={groupSessionInfo.maxParticipant.toString()}
            onChange={(value) => {
              const val = parseInt(value);
              if (!isNaN(val) && val >= 1) {
                setGroupSessionInfo({ ...groupSessionInfo, maxParticipant: val });
              }
            }}
            placeholder="Max Participants"
            className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-40 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div>
            <EditableField
              value={groupSessionInfo.platform_link}
              onChange={(value) => setGroupSessionInfo({ ...groupSessionInfo, platform_link: value })}
              placeholder="Platform Link (e.g., Zoom, Google Meet)"
              className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex gap-x-4 mt-2">
              <Link href="https://zoom.us/" target="_blank" className="flex items-center gap-x-1 text-sm text-gray-300 hover:text-orange-500">
                Zoom <ExternalLink className="w-4 h-4" />
              </Link>
              <Link href="https://meet.google.com/" target="_blank" className="flex items-center gap-x-1 text-sm text-gray-300 hover:text-orange-500">
                Google Meet <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <Button
              className="bg-orange-500 text-white rounded-md px-3 py-1.5 hover:bg-orange-600 transition-colors duration-200 text-sm font-medium"
              onClick={handleCreateGS}
              disabled={loading || !isValid}
            >
              Create
            </Button>
            {loading && <LoadingSpinner />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupSession;