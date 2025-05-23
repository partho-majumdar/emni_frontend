"use client";
import { minutesToHours } from "@/app/(student)/s/group-sessions/page";
import { createGroupSession } from "@/app/lib/mutations";
import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
import { hover_style, smooth_hover, theme_border } from "@/app/ui/CustomStyles";
import EditableField from "@/app/ui/EditableField";
import { Select, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SelectContent, SelectItem } from "@radix-ui/react-select";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const CreateGroupSession = () => {
  const router = useRouter();
  const [endTime, setEndTime] = React.useState<Date>(new Date());

  const [GroupSessionCreateInfo, setGroupSessionCreateInfo] = React.useState<{
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
    durationInMinutes: 0,
    maxParticipant: 25,
    platform_link: "",
  });
  const handleCreateGS = async () => {
    const res = await createGroupSession(GroupSessionCreateInfo);
    if (res) {
      router.push("/m/group-sessions");
    }
  };

  return (
    <div className="p-16">
      <div className="my-5">
        <EditableField
          value={GroupSessionCreateInfo.title}
          onChange={(value) => {
            setGroupSessionCreateInfo({
              ...GroupSessionCreateInfo,
              title: value,
            });
          }}
          placeholder="Group Session Title"
          className="font-semibold text-3xl w-full"
        />
      </div>
      <div className="flex gap-4 ">
        <textarea
          value={GroupSessionCreateInfo.description}
          placeholder="Write a description of your group session here"
          className="border rounded-lg w-[700px]  p-5 focus:outline-none focus:ring-none"
          onChange={(e) => {
            setGroupSessionCreateInfo({
              ...GroupSessionCreateInfo,
              description: e.target.value,
            });
          }}
        ></textarea>

        <div className="flex flex-col gap-4 border p-5 rounded-xl w-[400px]">
          <span>
            <EditableField
              value={GroupSessionCreateInfo.platform_link}
              onChange={(value) => {
                setGroupSessionCreateInfo({
                  ...GroupSessionCreateInfo,
                  platform_link: value,
                });
              }}
              placeholder="Provide Platform Link"
              className="text-lg w-full mt-4 border rounded-lg px-3 py-2 w-full"
            />
            <span className="flex gap-x-2 mb-4">
              <Link href="https://www.zoom.com/" target="_blank">
                <span className="flex gap-x-2 items-center my-4 text-sm hover:text-blue-500 select-none">
                  {" "}
                  Zoom
                  <ExternalLink className="w-4 h-4" />
                </span>
              </Link>
              <Link href="https://meet.google.com/" target="_blank">
                <span className="flex gap-x-2 items-center my-4 text-sm hover:text-blue-500 select-none">
                  {" "}
                  Google Meet
                  <ExternalLink className="w-4 h-4" />
                </span>
              </Link>
            </span>
            <Select
              onValueChange={(value) => {
                setGroupSessionCreateInfo({
                  ...GroupSessionCreateInfo,
                  maxParticipants: parseInt(value),
                });
              }}
            >
              <SelectTrigger className="w-[200px]">
                {GroupSessionCreateInfo.maxParticipants}
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 rounded-xl  font-semibold">
                {Array.from({ length: 9 }, (_, i) => (
                  <SelectItem
                    className="select-none w-[200px] flex justify-center"
                    key={i}
                    value={(10 + i * 5).toString()}
                  >
                    {10 + i * 5}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
          Start Time
          <DateTimePicker
            field={{
              value: GroupSessionCreateInfo.startDate,
              onChange: (value: Date) => {
                setGroupSessionCreateInfo({
                  ...GroupSessionCreateInfo,
                  startDate: value,
                });
              },
            }}
          />
          End Time
          <DateTimePicker
            field={{
              value: endTime,
              onChange: (value: Date) => {
                setEndTime(value);
                setGroupSessionCreateInfo({
                  ...GroupSessionCreateInfo,
                  durationInMinutes: Math.floor(
                    (value.getTime() -
                      GroupSessionCreateInfo.startDate.getTime()) /
                      1000 /
                      60,
                  ),
                });
              },
            }}
          />
          <span className="flex gap-x-2">
            <span className="font-semibold">Duration </span>

            {minutesToHours(GroupSessionCreateInfo.durationInMinutes)}
          </span>
          <span
            className={cn(
              smooth_hover,
              theme_border,
              hover_style,
              "flex justify-center select-none ",
            )}
            onClick={handleCreateGS}
          >
            Create
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupSession;
