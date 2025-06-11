"use client";
import Sidebar from "@/app/ui/Sidebar";
import React from "react";
import {
  Bell,
  Calendar,
  UserSearch,
  Inbox,
  LayoutGrid,
  Star,
  Users,
  Workflow,
  History,
  TicketCheck,
  MessagesSquare,
} from "lucide-react";

const SidebarElements = [
  {
    name: "Forum",
    icon: <MessagesSquare className="w-4 h-4" />,
    url: "/m/home",
  },
  {
    name: "Schedule",
    icon: <Calendar className="w-4 h-4" />,
    url: "/m/bookings",
  },
  {
    name: "1:1 Sessions",
    icon: <LayoutGrid className="w-4 h-4" />,
    url: "/m/mysessions",
  },
  {
    name: "Groups Sessions",
    icon: <Users className="w-4 h-4" />,
    url: "/m/group-sessions",
  },
  {
    name: "Bookings",
    icon: <TicketCheck className="w-4 h-4" />,
    url: "/m/bookedSession",
  },
  {
    name: "Mentors",
    icon: <UserSearch className="w-4 h-4" />,
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
    name: "Inbox",
    icon: <Inbox className="w-4 h-4" />,
    url: "/m/inbox",
  },
  {
    name: "Alerts",
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


// "use client";
// import Sidebar from "@/app/ui/Sidebar";
// import React from "react";
// import {
//   Bell,
//   Calendar,
//   ChartScatter,
//   Home,
//   Inbox,
//   LayoutGrid,
//   Star,
//   Users,
//   Workflow,
//   History,
//   BookMarked,
//   MessageSquareCode
// } from "lucide-react";

// const SidebarElements = [
//   {
//     name: "Discussion",
//     icon: <MessageSquareCode className="w-4 h-4" />, 
//     url: "/m/home",
//   },
//   {
//     name: "Time Slot",
//     icon: <Calendar className="w-4 h-4" />,
//     url: "/m/bookings",
//   },
//   {
//     name: "1:1 Sessions",
//     icon: <LayoutGrid className="w-4 h-4" />,
//     url: "/m/mysessions",
//   },
//   {
//     name: "Group Sessions",
//     icon: <Users className="w-4 h-4" />,
//     url: "/m/group-sessions",
//   },
//   {
//     name: "Paid Session",
//     icon: <BookMarked className="w-4 h-4" />,
//     url: "/m/bookedSession",
//   },
//   {
//     name: "Other Mentors",
//     icon: <ChartScatter className="w-4 h-4" />,
//     url: "/m/othermentors",
//   },
//   {
//     name: "Reviews",
//     icon: <Star className="w-4 h-4" />,
//     url: "/m/reviews",
//   },
//   {
//     name: "Jobs",
//     icon: <Workflow className="w-4 h-4" />,
//     url: "/m/jobs",
//   },
//   {
//     name: "History",
//     icon: <History className="w-4 h-4" />,
//     url: "/m/history",
//   },
// ];

// const SidebarTopNavigationButtons = [
//   {
//     name: "inbox",
//     icon: <Inbox className="w-4 h-4" />,
//     url: "/m/inbox",
//   },
//   {
//     name: "notifications",
//     icon: <Bell className="w-4 h-4" />,
//     url: "/m/notifications",
//   },
// ];

// export default function MentorLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="flex min-h-screen w-full bg-black">
//       <Sidebar
//         role="mentor"
//         SidebarElements={SidebarElements}
//         SidebarTopNavigationButtons={SidebarTopNavigationButtons}
//       />
//       <div className="flex flex-col w-full">
//         <div className="flex-1">{children}</div>
//       </div>
//     </div>
//   );
// }