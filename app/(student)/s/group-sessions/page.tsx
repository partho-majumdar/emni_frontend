"use client";
import { getGroupSessionsList } from "@/app/lib/fetchers";
import { GroupSessionInfoType } from "@/app/types";
import { smooth_hover } from "@/app/ui/CustomStyles";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, Hourglass } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { colors } from "@/app/ui/CustomStyles";

export const minutesToHours = (minutes: number) => {
  const hours: number = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (remain > 0) {
    if (hours === 0) {
      return `${remain} minutes`;
    }
    return `${hours} hours ${remain} minutes`;
  } else {
    return `${hours} hours`;
  }
};

const GroupSessionPage = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType[] | null>(null);
  useEffect(() => {
    const fn = async () => {
      const data: GroupSessionInfoType[] = await getGroupSessionsList();
      setGsInfo(data);
    };
    fn();
  }, []);
  return (
    <ScrollArea className="h-screen">
      <div className="p-16 flex flex-wrap gap-10">
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
      `/s/group-sessions/${GroupSessionDetails.id}?bg=${ColorTheme.bg}&text=${ColorTheme.text}`,
    );
  };
  return (
    <Card
      className={cn(
        "w-[700px] hover:opacity-90 select-none border-none",
        ColorTheme.bg,
      )}
      onClick={handleGSClick}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-2 font-semibold">
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-white">
              <Image
                src={GroupSessionDetails.mentor.photoLink}
                alt="mentor"
                width={50}
                height={50}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <span>{GroupSessionDetails.mentor.name}</span>
          </div>
          <div className="flex items-center font-bold gap-x-2">
            <div className="flex">
              {GroupSessionDetails.previewParticipants &&
                GroupSessionDetails.previewParticipants.map((item, i) => {
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger className="-ml-2">
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-white">
                          {item.photoLink.length ? (
                            <Image
                              src={item.photoLink}
                              alt="mentor"
                              width={50}
                              height={50}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          ) : null}
                        </div>
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
        <CardTitle className={cn("text-8xl font-black ", ColorTheme.text)}>
          {GroupSessionDetails.title}
        </CardTitle>
        <div className="flex justify-between my-2">
          <span className="flex  gap-x-4 font-semibold">
            <span className="flex gap-x-2">
              <Hourglass />
              {minutesToHours(GroupSessionDetails.durationInMinutes)}
            </span>
            <span className="flex gap-x-2">
              <Clock />
              {format(GroupSessionDetails.startTime, "Pp")}
            </span>
          </span>
          <span
            className={cn(
              "font-semibold cursor-pointer hover:opacity-80",
              smooth_hover,
            )}
          >
            {" "}
            Book A Seat
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GroupSessionPage;