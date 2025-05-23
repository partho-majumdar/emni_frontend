import {
  getMentorBasedOnInterest,
  getMentorBasedOnLevel,
} from "@/app/lib/fetchers/student";
import { MentorSuggestionType } from "@/app/types";
import { gradientText1 } from "@/app/ui/CustomStyles";
import MentorShowCard from "@/app/ui/MentorShowCard";
import { jakarta } from "@/app/utils/font";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";

const page = async () => {
  const mentorsOnInterest: MentorSuggestionType[] =
    await getMentorBasedOnInterest();
  //const mentorOnTopRated: MentorSuggestionType[] =
  //  await getMentorBasedOnLevel();
  return (
    <div className="px-16">
      <div className="flex justify-end items-center">
        <div
          className={cn(
            "font-semibold text-5xl  px-2 pb-2 my-6 z-10 ",
            jakarta.className,
            // "border-b-2 border-orange-800",
            gradientText1,
          )}
        >
          Find Mentor
        </div>
      </div>
      <div className={cn("w-[1500px] flex flex-col gap-y-5 mb-10")}>
        <span className={cn(jakarta.className, " text-4xl font-semibold")}>
          Mentors with Similar Interest
        </span>
        <ScrollArea>
          <div className="flex gap-x-2">
            {mentorsOnInterest.map((m, i) => (
              <MentorShowCard key={i} MentorDetails={m} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className={cn("w-[1500px] flex flex-col gap-y-5")}>
        <span className={cn(jakarta.className, " text-4xl font-semibold")}>
          Top Rated Mentors
        </span>
        <ScrollArea>
          <div className="flex gap-x-2">
            {mentorsOnInterest.map((m, i) => (
              <MentorShowCard key={i} MentorDetails={m} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default page;
