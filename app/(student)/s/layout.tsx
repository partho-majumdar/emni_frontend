"use client";
import Sidebar from "@/app/ui/Sidebar";
import React from "react";
import {
  Home,
  Bell,
  Calendar,
  CalendarClock,
  Group,
  History,
  Inbox,
  TrafficCone,
  UserSearch,
  Workflow,
  Merge,
} from "lucide-react";

const SidebarElements = [
  {
    name: "Home",
    icon: <Home className="w-4 h-4" />, 
    url: "/s/home",
  },
  {
    name: "AI Roadmap",
    icon: <TrafficCone className="w-4 h-4" />,
    url: "/s/airoadmap",
  },
  {
    name: "Schedule",
    icon: <Calendar className="w-4 h-4" />,
    url: "/s/schedule",
  },
  {
    name: "Find Mentor",
    icon: <UserSearch className="w-4 h-4" />,
    url: "/s/findmentor",
  },
  {
    name: "1:1 Sessions",
    icon: <CalendarClock className="w-4 h-4" />,
    url: "/s/sessions",
  },
  {
    name: "Group Sessions",
    icon: <Group className="w-4 h-4" />,
    url: "/s/group-sessions",
  },
  
  {
    name: "Booked Session",
    icon: <Merge className="w-4 h-4" />,
    url: "/s/joinSession",
  },
  {
    name: "Jobs",
    icon: <Workflow className="w-4 h-4" />,
    url: "/s/jobs",
  },
  {
    name: "History",
    icon: <History className="w-4 h-4" />,
    url: "/s/history",
  },
];

const SidebarTopNavigationButtons = [
  {
    name: "inbox",
    icon: <Inbox className="w-4 h-4" />,
    url: "/s/inbox",
  },
  {
    name: "notifications",
    icon: <Bell className="w-4 h-4" />,
    url: "/s/notifications",
  },
];

export default function StudentProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-screen h-screen">
      <Sidebar
        role="student"
        SidebarElements={SidebarElements}
        SidebarTopNavigationButtons={SidebarTopNavigationButtons}
      />
      <div className="flex flex-col w-full">
        <div>{children}</div>
      </div>
    </div>
  );
}