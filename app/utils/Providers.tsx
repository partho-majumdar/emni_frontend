import { ReactNode } from "react";
import { StudentDataProvider } from "../contexts/StudentDataContext";
import { MentorDataProvider } from "../contexts/MentorDataContext";
import { CalendarProvider } from "../ui/CalendarUI/CalendarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <MentorDataProvider>
        <StudentDataProvider>
          <CalendarProvider>{children}</CalendarProvider>
        </StudentDataProvider>
      </MentorDataProvider>
    </TooltipProvider>
  );
}
