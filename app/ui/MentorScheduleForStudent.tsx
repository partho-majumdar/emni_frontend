"use client";
import React, { useEffect, useState } from "react";
import { getMentorAvailableSlots } from "../lib/fetchers/student";
import { AvalabilityType, MentorInfoType, SessionInfoType } from "../types";
import { format, intervalToDuration } from "date-fns";
import { cn } from "@/lib/utils";
import { hover_style, smooth_hover, theme_border } from "./CustomStyles";
import { getMentorPersonalInfo } from "../lib/fetchers/mentor";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Props = {
  sessionDetails: SessionInfoType;
};

const MentorScheduleForStudent = (props: Props) => {
  const mid = props.sessionDetails.mentorId;
  const [selectedSlot, setSelectedSlot] = useState<AvalabilityType | null>(null);
  const [mentorFreeSlots, setMentorFreeSlots] = useState<AvalabilityType[]>([]);
  const [mentorInfo, setMentorInfo] = useState<MentorInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sessionDetails } = props;
  const router = useRouter();

  useEffect(() => {
    const fetchMentorSlots = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Session details:", sessionDetails);
        if (!sessionDetails.DurationInMinutes || sessionDetails.DurationInMinutes <= 0) {
          setError("Invalid session duration");
          return;
        }
        if (!sessionDetails.session_medium || sessionDetails.session_medium.length === 0) {
          setError("Session medium not specified");
          return;
        }

        const res: AvalabilityType[] = await getMentorAvailableSlots(mid as string);
        console.log("Fetched slots:", res);

        if (!res || res.length === 0) {
          setError("No available slots found for this mentor");
          return;
        }

        setMentorFreeSlots(res);

        const mentorDetails: MentorInfoType = await getMentorPersonalInfo(mid as string);
        setMentorInfo(mentorDetails);
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load available slots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (mid) {
      fetchMentorSlots();
    }
  }, [mid, sessionDetails.DurationInMinutes, sessionDetails.session_medium]);

  const filterValidSlots = (slots: AvalabilityType[]) => {
    console.log("All slots before filtering:", slots);
    console.log("Session duration required:", sessionDetails.DurationInMinutes);
    console.log("Session medium required:", sessionDetails.session_medium);

    const validSlots = slots.filter((slot) => {
      const duration = intervalToDuration({ start: slot.start, end: slot.end });
      const totalMinutes = (duration.hours || 0) * 60 + (duration.minutes || 0);
      const isMediumValid = sessionDetails.session_medium.some((medium) =>
        slot.medium.includes(medium)
      );
      console.log(
        `Slot ${slot.id}: Duration ${totalMinutes} minutes, Medium valid: ${isMediumValid}, Booked: ${JSON.stringify(slot.booked)}`
      );
      return totalMinutes >= sessionDetails.DurationInMinutes && isMediumValid;
    });

    console.log("Valid slots after filtering:", validSlots);
    return validSlots;
  };

  const groupSlotsByDate = (slots: AvalabilityType[]) => {
    const dateMap = new Map<number, AvalabilityType[]>();

    slots.forEach((slot) => {
      const date = slot.start.getDate();
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(slot);
    });

    const grouped = Array.from(dateMap.entries()).map(([date, slots]) => ({
      date,
      slots,
    }));

    console.log("Grouped slots:", grouped);
    return grouped;
  };

  const goToPayment = () => {
    if (selectedSlot) {
      router.replace(
        `/s/payment?s=${sessionDetails.sessionId}&a=${selectedSlot.id}`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-3 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const validSlots = filterValidSlots(mentorFreeSlots);
  if (validSlots.length === 0) {
    return (
      <div className="text-center py-3 text-gray-400 text-sm">
        No slots available that match the session's duration or medium requirements.
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(validSlots);

  return (
    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <ScrollArea className="h-[200px] w-full">
        <div className="space-y-3">
          {groupedSlots.map(({ date, slots }) => (
            <div key={date} className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">
                {format(slots[0].start, "PPPP")}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-md cursor-pointer px-2 py-1.5 text-center transition-all duration-200",
                      "border text-xs",
                      selectedSlot?.id === slot.id
                        ? "bg-orange-600/20 border-orange-500 text-orange-200"
                        : "bg-gray-800/60 border-gray-600 text-gray-300 hover:border-orange-400 hover:bg-gray-700/80"
                    )}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="font-medium">
                      {format(slot.start, "h:mm a")} - {format(slot.end, "h:mm a")}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                      {slot.medium.join(" • ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="flex justify-center mt-3">
        <button
          disabled={!selectedSlot}
          onClick={goToPayment}
          className={cn(
            "px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200",
            selectedSlot
              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {selectedSlot ? "Continue to Payment" : "Select a time slot"}
        </button>
      </div>
    </div>
  );
};

export default MentorScheduleForStudent;