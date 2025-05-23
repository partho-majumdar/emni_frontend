"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface CalendarContextType {
  date: Date;
  setDate: (newDate: Date) => void;
}

const CalendarContext = createContext<CalendarContextType>({
  date: new Date(),
  setDate: () => {},
});

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <CalendarContext.Provider value={{ date, setDate }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider"
    );
  }
  return context;
};
