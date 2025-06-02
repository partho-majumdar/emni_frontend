"use client";
import Sidebar from "@/app/ui/Sidebar";
import React from "react";
import {
  Bell,
  Calendar,
  ChartScatter,
  Home,
  Inbox,
  LayoutGrid,
  Star,
  Users,
  Workflow,
  History,
  BookMarked
} from "lucide-react";

const SidebarElements = [
  {
    name: "Home",
    icon: <Home className="w-4 h-4" />, 
    url: "/m/home",
  },
  {
    name: "Time Slot",
    icon: <Calendar className="w-4 h-4" />,
    url: "/m/bookings",
  },
  {
    name: "1:1 Sessions",
    icon: <LayoutGrid className="w-4 h-4" />,
    url: "/m/mysessions",
  },
  {
    name: "Group Sessions",
    icon: <Users className="w-4 h-4" />,
    url: "/m/group-sessions",
  },
  {
    name: "Paid Session",
    icon: <BookMarked className="w-4 h-4" />,
    url: "/m/bookedSession",
  },
  {
    name: "Other Mentors",
    icon: <ChartScatter className="w-4 h-4" />,
    url: "/m/othermentors",
  },
  {
    name: "Reviews",
    icon: <Star className="w-4 h-4" />,
    url: "/m/reviews",
  },
  {
    name: "Jobs",
    icon: <Workflow className="w-4 h-4" />,
    url: "/m/jobs",
  },
  {
    name: "History",
    icon: <History className="w-4 h-4" />,
    url: "/m/history",
  },
];

const SidebarTopNavigationButtons = [
  {
    name: "inbox",
    icon: <Inbox className="w-4 h-4" />,
    url: "/m/inbox",
  },
  {
    name: "notifications",
    icon: <Bell className="w-4 h-4" />,
    url: "/m/notifications",
  },
];

export default function MentorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full bg-black">
      <Sidebar
        role="mentor"
        SidebarElements={SidebarElements}
        SidebarTopNavigationButtons={SidebarTopNavigationButtons}
      />
      <div className="flex flex-col w-full">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}