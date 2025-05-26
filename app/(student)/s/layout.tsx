// import Sidebar from "@/app/ui/Sidebar";
// import React from "react";

// import {
//   Bell,
//   Calendar,
//   CalendarClock,
//   Group,
//   History,
//   Inbox,
//   TrafficCone,
//   UserSearch,
//   Workflow,
// } from "lucide-react";

// const SidebarElements = [
//   {
//     name: "AI Roadmap",
//     icon: <TrafficCone />,
//     url: "/s/airoadmap",
//   },
//   {
//     name: "Schedule",
//     icon: <Calendar />,
//     url: "/s/schedule",
//   },
//   {
//     name: "Find Mentor",
//     icon: <UserSearch />,
//     url: "/s/findmentor",
//   },
//   {
//     name: "1:1 Sessions",
//     icon: <CalendarClock />,
//     url: "/s/sessions",
//   },
//   {
//     name: "Group Sessions",
//     icon: <Group />,
//     url: "/s/group-sessions",
//   },
//   {
//     name: "History",
//     icon: <History />,
//     url: "/s/history",
//   },
//   {
//     name: "Jobs",
//     icon: <Workflow />,
//     url: "/s/jobs",
//   },
// ];

// const SidebarTopNavigationButtons = [
//   {
//     name: "inbox",
//     icon: <Inbox />,
//     url: "/s/inbox",
//   },
//   {
//     name: "notifications",
//     icon: <Bell />,
//     url: "/s/notifications",
//   },
// ];
// export default function StudentLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="flex w-screen h-screen">
//       <Sidebar
//         role="student"
//         SidebarElements={SidebarElements}
//         SidebarTopNavigationButtons={SidebarTopNavigationButtons}
//       />
//       <div className="flex flex-col w-full">
//         <div>{children}</div>
//       </div>
//     </div>
//   );
// }

// ------------------ above text written by rafi -----------------

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
    name: "History",
    icon: <History className="w-4 h-4" />,
    url: "/s/history",
  },
  {
    name: "Jobs",
    icon: <Workflow className="w-4 h-4" />,
    url: "/s/jobs",
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