import React from "react";
import { MentorSuggestionType } from "../types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Props = {
  mentorList: MentorSuggestionType[];
};

const FindMentorRow = (props: Props) => {
  return (
    <ScrollArea>
      {mentor}
      <ScrollBar />
    </ScrollArea>
  );
};

export default FindMentorRow;
