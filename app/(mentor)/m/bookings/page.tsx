"use client";
import { getAvailabilities } from "@/app/lib/fetchers/mentor";
import { AvalabilityType } from "@/app/types";
import AddAvailabilityBooking from "@/app/ui/AddAvailabilityBooking";
import CalendarMonthSwitcher from "@/app/ui/CalendarUI/CalendarMonthSwitcher";
import CalendarUI from "@/app/ui/CalendarUI/CalendarUI";
import React, { useEffect, useState } from "react";

const Bookings = () => {
  const [availabilities, setAvailabilities] = useState<AvalabilityType[]>([]);
  console.log("avails ", availabilities);
  useEffect(() => {
    const fn = async () => {
      const res = await getAvailabilities();
      setAvailabilities(res);
    };
    fn();
  }, []);

  return (
    <div className=" flex flex-col h-screen">
      <div className="h-[100px] border-b flex items-center justify-between px-2">
        <div className="flex gap-2 items-center">
          <div>
            <CalendarMonthSwitcher />
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-[20px] h-[20px] bg-orange-800 rounded-2xl"></div>
            Booked Slot
          </div>
        </div>
        <div>
          <AddAvailabilityBooking
            availabilityState={{
              values: availabilities,
              onChange: (val: AvalabilityType) => {
                setAvailabilities([...availabilities, val]);
              },
            }}
          />
        </div>
      </div>
      <div className="flex-grow">
        <CalendarUI
          availabilities={availabilities}
          updateAvailabilities={(availability: AvalabilityType) =>
            setAvailabilities(
              availabilities.filter((item) => item.id !== availability.id),
            )
          }
        />
      </div>
    </div>
  );
};

export default Bookings;
