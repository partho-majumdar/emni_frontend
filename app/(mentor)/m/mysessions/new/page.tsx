"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { SessionInfoType, SessionType } from "@/app/types";
import EditableField from "@/app/ui/EditableField";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { smooth_hover, theme_style } from "@/app/ui/CustomStyles";
import { createSession } from "@/app/lib/mutations/mentor";
import { useRouter } from "next/navigation";

const topics = [
  "Course Topic Tution",
  "Project Help",
  "Career Guidance",
  "Competition Prep",
  "Productivity",
  "ECA",
  "Resume Review",
  "Research Guidance",
  "Mock Interview",
];

const CreateNewSession = () => {
  const [sessionDetails, setSessionDetails] = useState<SessionInfoType>({
    type: "Course Topic Tution",
    title: "",
    DurationInMinutes: 0,
    session_medium: ["online"],
    Description: "",
    Price: 0,
  });
  const r = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const handleCreateSession = async () => {
    const res = await createSession(sessionDetails);
    if (res.err) {
      setErr(res.err);
    }
    r.push("/m/mysessions");
  };
  return (
    <div className="p-5 mt-20 mr-20">
      <div className="text-3xl font-semibold">Create A New Session</div>
      <div>
        <EditableField
          value={sessionDetails.title}
          onChange={(value) =>
            setSessionDetails({ ...sessionDetails, title: value })
          }
          placeholder="Session Title"
          className="mt-5 text-3xl py-2 border rounded-lg w-1/2 px-3"
        />
        <div className="flex gap-x-4 my-5">
          <Select
            onValueChange={(val) =>
              setSessionDetails({
                ...sessionDetails,
                type: val as SessionType,
              })
            }
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue placeholder="Session Type" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => {
                return (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val) => {
              const duration = parseInt(val);
              setSessionDetails({
                ...sessionDetails,
                DurationInMinutes: duration,
              });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="150">2.5 hours</SelectItem>
              <SelectItem value="180">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-x-4 text-xl items-center">
          <span className="flex h-full items-center">
            <Checkbox
              className="w-5 h-5"
              onCheckedChange={(b) => {
                if (b && !sessionDetails.session_medium.includes("online")) {
                  setSessionDetails({
                    ...sessionDetails,
                    session_medium: [
                      ...sessionDetails.session_medium,
                      "online",
                    ],
                  });
                }
              }}
            />
            <span className="ml-2">Online</span>
          </span>

          <span className="flex h-full items-center">
            <Checkbox
              className="w-5 h-5"
              onCheckedChange={(b) => {
                if (b && !sessionDetails.session_medium.includes("offline")) {
                  setSessionDetails({
                    ...sessionDetails,
                    session_medium: [
                      ...sessionDetails.session_medium,
                      "offline",
                    ],
                  });
                }
              }}
            />
            <span className="ml-2">Offline</span>
          </span>
        </div>
        <div>
          <textarea
            onChange={(e) =>
              setSessionDetails({
                ...sessionDetails,
                Description: e.target.value,
              })
            }
            placeholder="Description"
            className="my-10 text-xl w-1/2 h-[200px] p-5 border rounded-lg border focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          Put a price for the session
          <span className="opacity-50">Price must be under 500 UCOIN</span>
          <EditableField
            value={sessionDetails.Price.toString()}
            onChange={(value) => {
              const val = parseInt(value);

              if (value === "") {
                setSessionDetails({
                  ...sessionDetails,
                  Price: 0, // or empty string if you want
                });
                return;
              }

              if (!isNaN(val)) {
                if (val >= 1 && val <= 500) {
                  setSessionDetails({
                    ...sessionDetails,
                    Price: val,
                  });
                }
              }
            }}
            placeholder="Price"
            className="mt-2 text-3xl py-2 border rounded-lg w-[300px] px-3"
          />
        </div>
        <div className={"my-5"}>
          <span
            className={`${theme_style} rounded-lg p-2 my-5 cursor-pointer hover:opacity-70 ${smooth_hover} text-lg`}
            onClick={handleCreateSession}
          >
            Create Session
          </span>
          <span>{err}</span>
        </div>
      </div>
    </div>
  );
};

export default CreateNewSession;
