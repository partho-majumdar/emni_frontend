"use client";
import { GroupSessionInfoType } from "@/app/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { colors, smooth_hover } from "@/app/ui/CustomStyles";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, Edit, Hourglass, Trash2 } from "lucide-react";
import { minutesToHours } from "@/app/(student)/s/group-sessions/page";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getGroupSessionListByMentorId } from "@/app/lib/fetchers";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const GroupSessions = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fn = async () => {
      const mID = localStorage.getItem("mentor-id");
      if (mID) {
        const data: GroupSessionInfoType[] =
          await getGroupSessionListByMentorId(mID);
        setGsInfo(data);
      } else {
        console.error("Mentor ID not found in local storage");
      }
    };
    fn();
  }, []);

  return (
    <ScrollArea className="h-screen">
      <div className="p-16 flex justify-center flex-wrap gap-10">
        <Card
          className="w-[500px] hover:bg-zinc-900 flex items-center justify-center"
          onClick={() => {
            router.push("/m/group-sessions/create");
          }}
        >
          <span className="text-2xl font-semibold select-none">
            Create A New Group Session
          </span>
        </Card>
        {gsInfo &&
          gsInfo.map((grpSession, i) => (
            <GroupSessionCard
              key={grpSession.id}
              GroupSessionDetails={grpSession}
              ColorTheme={colors[i % colors.length]}
            />
          ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

type Props = {
  GroupSessionDetails: GroupSessionInfoType;
  ColorTheme: {
    bg: string;
    text: string;
  };
};

const GroupSessionCard = ({ GroupSessionDetails, ColorTheme }: Props) => {
  const router = useRouter();
  const handleGSClick = () => {
    router.replace(
      `/m/group-sessions/${GroupSessionDetails.id}?bg=${ColorTheme.bg}&text=${ColorTheme.text}`,
    );
  };
  return (
    <Card
      className={cn(
        "w-[500px] hover:opacity-90 select-none border-none",
        ColorTheme.bg,
      )}
      onClick={handleGSClick}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          {/* <div className="flex items-center gap-x-2 font-semibold">
            <Image
              className="rounded-full border-2 border-white"
              src={GroupSessionDetails.mentor.photoLink}
              alt="mentor image"
              width={50}
              height={50}
            />
            <span>{GroupSessionDetails.mentor.name}</span>
          </div> */}
          <div className="flex items-center font-bold gap-x-2">
            <div className="flex">
              {GroupSessionDetails.previewParticipants.map((item, i) => {
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger className="-ml-2">
                      <span className="w-[40px] h-[40px] overflow-hidden">
                        <Image
                          key={i}
                          src={item.photoLink}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full  border-2 border-white  "
                          unoptimized
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{item.name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            <div>
              {GroupSessionDetails.participants.current}/
              {GroupSessionDetails.participants.max}
            </div>
          </div>
        </div>
        <CardTitle className={cn("text-6xl font-black ", ColorTheme.text)}>
          {GroupSessionDetails.title}
        </CardTitle>
        <div className="flex justify-between my-2">
          <span className="flex flex-col  gap-y-4 font-semibold">
            <span className="flex gap-x-2">
              <Hourglass />
              {minutesToHours(GroupSessionDetails.durationInMinutes)}
            </span>
            <span className="flex gap-x-2">
              <Clock />
              {format(GroupSessionDetails.startTime, "Pp")}
            </span>
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GroupSessions;
