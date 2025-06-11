"use client";
import React, { ReactElement, useEffect, useState } from "react";
import Toggler from "./Toggler";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { hover_style, smooth_hover, theme_style } from "./CustomStyles";
import { usePathname, useRouter } from "next/navigation";
import { getMyProfileDetailsMentor } from "../lib/fetchers/mentor";
import { MentorInfoType, NextBookedType, StudentInfoType } from "../types";
import { getMyProfileDetailsStudent } from "../lib/fetchers/student";
import SidebarTimeLeft from "./SidebarTimeLeft";
import { isAfter, isBefore } from "date-fns";
import Image from "next/image";
import { getAvatar } from "../utils/utility";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { clearCookie } from "../(auth)/authActions";

type Props = {
  role: "student" | "mentor";
  SidebarElements: {
    name: string;
    icon: ReactElement;
    url: string;
  }[];
  SidebarTopNavigationButtons: {
    name: string;
    icon: ReactElement;
    url: string;
  }[];
};

const Sidebar = ({
  role,
  SidebarElements,
  SidebarTopNavigationButtons,
}: Props) => {
  const [selected, setSelected] = React.useState<string>("");
  const thisurl = usePathname();
  const router = useRouter();
  const [nextBooked, setNextBooked] = useState<NextBookedType | null>(null);
  const [myprofileStudent, setMyProfileStudent] =
    useState<StudentInfoType | null>(null);
  const [myProfileMentor, setMyProfileMentor] = useState<MentorInfoType | null>(
    null,
  );
  
  const handleLogOut = async () => {
    localStorage.removeItem("student-id");
    localStorage.removeItem("mentor-id");
    await clearCookie();
    router.push("/sign-in");
  };

  useEffect(() => {
    const fn = async () => {
      if (role === "student") {
        const p: StudentInfoType = await getMyProfileDetailsStudent();
        setMyProfileStudent(p);
      } else if (role === "mentor") {
        const p: MentorInfoType = await getMyProfileDetailsMentor();
        setMyProfileMentor(p);
      }
    };
    fn();
  }, []);

  return (
    <div className="w-[300px] h-screen flex flex-col justify-between bg-gray-900/50 border-r border-gray-700 shadow-xl">
      {/* Top Section */}
      <div className="flex flex-col">
        <Toggler
          TogglerElements={SidebarTopNavigationButtons}
          selected={selected}
          setSelected={setSelected}
        />
        
        {/* Navigation Links */}
        <div className="my-2 p-2 flex flex-col gap-y-1">
          {SidebarElements.map((element) => (
            <Link
              href={element.url}
              key={element.name}
              onClick={() => setSelected(element.name)}
            >
              <div
                className={cn(
                  "flex items-center gap-x-3 py-2 px-6 cursor-pointer text-md transition-all duration-200",
                  thisurl === element.url 
                    ? "bg-gradient-to-r from-orange-900/50 to-amber-900/50 text-white border-l-4 border-amber-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                  "rounded-md",
                )}
              >
                <span className={thisurl === element.url ? "text-amber-300" : "text-gray-400"}>
                  {element.icon}
                </span>
                <span>{element.name}</span>
              </div>
            </Link>
          ))}
          
          {/* Upcoming Sessions */}
          <div className="mt-6">
            {nextBooked && isAfter(nextBooked.StartTime, new Date()) && (
              <SidebarTimeLeft BookedSession={nextBooked} status="upcoming" />
            )}
            {nextBooked && !isBefore(new Date(), nextBooked.StartTime) && (
              <SidebarTimeLeft BookedSession={nextBooked} status="goingon" />
            )}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        {myprofileStudent && (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500">
                  <Image
                    src={
                      myprofileStudent.image_link.length
                        ? myprofileStudent.image_link
                        : getAvatar(myprofileStudent.username)
                    }
                    alt="mentor"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {myprofileStudent.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-300 truncate">
                      @{myprofileStudent.username}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="bg-gray-800 border-gray-700 shadow-xl w-48 p-2">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => router.push("/s/myprofile")}
                  className="px-3 py-2 text-left text-sm text-gray-200 hover:bg-amber-900/30 rounded-md transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogOut}
                  className="px-3 py-2 text-left text-sm text-gray-200 hover:bg-amber-900/30 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {myProfileMentor && (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500">
                  <Image
                    src={
                      myProfileMentor.image_link.length
                        ? myProfileMentor.image_link
                        : getAvatar(myProfileMentor.username)
                    }
                    alt="my profile"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {myProfileMentor.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-300 truncate">
                      @{myProfileMentor.username}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="bg-gray-800 border-gray-700 shadow-xl w-48 p-2">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => router.push("/m/myprofile")}
                  className="px-3 py-2 text-left text-sm text-gray-200 hover:bg-amber-900/30 rounded-md transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogOut}
                  className="px-3 py-2 text-left text-sm text-gray-200 hover:bg-amber-900/30 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Sidebar;