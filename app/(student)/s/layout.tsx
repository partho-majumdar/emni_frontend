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
  MessagesSquare,
  TicketCheck,
  Star,
  StarHalf,
  BotIcon,
} from "lucide-react";

const SidebarElements = [
  {
    name: "Forum",
    icon: <MessagesSquare className="w-4 h-4" />,
    url: "/s/home",
  },
  {
    name: "AI ~ Agent",
    icon: <BotIcon className="w-4 h-4" />,
    url: "/s/aiChat",
  },
  {
    name: "Schedule",
    icon: <Calendar className="w-4 h-4" />,
    url: "/s/schedule",
  },
  {
    name: "Mentors",
    icon: <UserSearch className="w-4 h-4" />,
    url: "/s/findmentor",
  },
  {
    name: "1:1 Sessions",
    icon: <CalendarClock className="w-4 h-4" />,
    url: "/s/sessions",
  },
  {
    name: "Groups Sessions",
    icon: <Group className="w-4 h-4" />,
    url: "/s/group-sessions",
  },
  {
    name: "Bookings",
    icon: <TicketCheck className="w-4 h-4" />,
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
    name: "Inbox",
    icon: <Inbox className="w-4 h-4" />,
    url: "/s/inbox",
  },
  {
    name: "Alerts",
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
