"use client";
import React from "react";
import { MentorSuggestionType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { jakarta } from "../utils/font";
import { getLevelColor } from "../utils/LevelColor";
import { useRouter } from "next/navigation";
import { smooth_hover } from "./CustomStyles";

type Props = {
  MentorDetails: MentorSuggestionType;
};

const MentorShowCard = (props: Props) => {
  const { MentorDetails } = props;
  const router = useRouter();
  console.log(MentorDetails);
  const handleMentorCardClick = () => {
    router.replace(`/s/mprofile/${MentorDetails.mentorId}`);
  };
  return (
    <Card
      className={cn(
        "w-[300px] border-none select-none bg-zinc-800/30 hover:bg-zinc-800/70",
        smooth_hover,
      )}
      onClick={handleMentorCardClick}
    >
      <CardHeader className="flex justify-center">
        <div className="w-[100px] h-[100px] rounded-lg overflow-hidden border-[3px] border-orange-800/30 flex items-center justify-center bg-white bg-zinc-950">
          <Image
            src={MentorDetails.profile_pic}
            alt="Profile Picture"
            width={100}
            height={100}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="flex flex-col items-start">
          <span
            className={cn(
              "flex justify-",
              jakarta.className,
              "text-sm rounded-sm px-2 h-[20px] font-bold",
              getLevelColor(MentorDetails.level),
            )}
          >
            {MentorDetails.level.toUpperCase()}
          </span>
          <CardTitle className="text-4xl">{MentorDetails.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col ">
          <span className="my-2 text-md font-semibold">
            {MentorDetails.bio}
          </span>
          <div className="flex gap-x-2 text-md ">
            <span className="flex gap-x-2 ">
              Sessions
              <span className="bg-orange-800 px-1 rounded-sm">
                {MentorDetails.sessions_taken}
              </span>
            </span>

            <span className="flex gap-x-2">
              Reviews
              <span className="bg-orange-800 px-1 rounded-sm">
                {MentorDetails.review_count}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorShowCard;
