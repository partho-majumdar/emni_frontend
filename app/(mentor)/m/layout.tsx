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
// } from "lucide-react";

// const SidebarElements = [
//   {
//     name: "Home",
//     icon: <Home />,
//     url: "/m/home",
//   },
//   {
//     name: "My Sessions",
//     icon: <LayoutGrid />,
//     url: "/m/mysessions",
//   },
//   {
//     name: "Bookings",
//     icon: <Calendar />,
//     url: "/m/bookings",
//   },
//   {
//     name: "Other Mentors",
//     icon: <ChartScatter />,
//     url: "/m/othermentors",
//   },
//   {
//     name: "Reviews",
//     icon: <Star />,
//     url: "/m/reviews",
//   },
//   {
//     name: "Group Sessions",
//     icon: <Users />,
//     url: "/m/group-sessions",
//   },
//   {
//     name: "Jobs",
//     icon: <Workflow />,
//     url: "/m/jobs",
//   },
// ];

// const SidebarTopNavigationButtons = [
//   {
//     name: "inbox",
//     icon: <Inbox />,
//     url: "/m/inbox",
//   },
//   {
//     name: "notifications",
//     icon: <Bell />,
//     url: "/m/notifications",
//   },
// ];
// export default function MentorLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="flex w-screen">
//       <Sidebar
//         role="mentor"
//         SidebarElements={SidebarElements}
//         SidebarTopNavigationButtons={SidebarTopNavigationButtons}
//       />
//       <div className="flex flex-col w-full">
//         {/* <div className="h-[70px] border-b w-full">topbar</div> */}
//         <div>{children}</div>
//       </div>
//     </div>
//   );
// }

// -------------------- above code written by rafi ----------------------

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
} from "lucide-react";

const SidebarElements = [
  {
    name: "Home",
    icon: <Home className="w-4 h-4" />, 
    url: "/m/home",
  },
  {
    name: "My Sessions",
    icon: <LayoutGrid className="w-4 h-4" />,
    url: "/m/mysessions",
  },
  {
    name: "Bookings",
    icon: <Calendar className="w-4 h-4" />,
    url: "/m/bookings",
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
    name: "Group Sessions",
    icon: <Users className="w-4 h-4" />,
    url: "/m/group-sessions",
  },
  {
    name: "Jobs",
    icon: <Workflow className="w-4 h-4" />,
    url: "/m/jobs",
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