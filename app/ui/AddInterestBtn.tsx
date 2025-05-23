import React, { useEffect, useState } from "react";
import { hover_style, theme_border, theme_style } from "./CustomStyles";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InterestType } from "../types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { updateInterestListStudent } from "../lib/mutations/student";
import { updateInterestListMentor } from "../lib/mutations/mentor";
import { getEntireInterestsList } from "../lib/fetchers";
import { toast } from "sonner";

type Props = {
  SelectCount: number;
  student?: boolean;
  updateInterestList: (newInterests: InterestType[]) => void;
  value: InterestType[];
  role: "mentor" | "student";
};

const AddInterestBtn = (props: Props) => {
  const [selectedInterests, setSelectedInterests] = useState<InterestType[]>(
    props.value,
  );
  const [all, setAll] = useState<InterestType[] | null>();
  const [err, setErr] = React.useState<string | null>(null);

  useEffect(() => {
    const fn = async () => {
      const data: InterestType[] = await getEntireInterestsList();
      setAll(data);
    };
    fn();
  }, []);

  const handleSubmission = async () => {
    props.updateInterestList(selectedInterests);
    if (props.role === "mentor") {
      const res = await updateInterestListMentor(selectedInterests);
      if (res.success) {
        toast.success("Success: Interest List Updated!");
      } else {
        toast.error("Failed to update Interest List!");
      }
    } else {
      const res = await updateInterestListStudent(selectedInterests);
      if (res.success) {
        toast.success("Success: Interest List Updated!");
      } else {
        toast.error("Failed to update Interest List!");
      }
    }
  };

  useEffect(() => {
    setSelectedInterests(props.value);
  }, [props.value]);

  return (
    <Dialog>
      <DialogTrigger>
        <span
          className={cn(
            hover_style,
            theme_border,
            "flex justify-center border  px-2 cursor-pointer",
          )}
        >
          +
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="flex justify-between pr-5">
          Add interests
          <span>
            {selectedInterests.length}/{props.SelectCount}
          </span>
        </DialogTitle>
        <ScrollArea>
          <div className="flex flex-wrap gap-2 h-[500px] ">
            {all &&
              all.map((interest) => (
                <span
                  className={cn(
                    theme_border,
                    selectedInterests.some(
                      (selected) =>
                        selected.interest_id === interest.interest_id,
                    )
                      ? theme_style
                      : hover_style,
                    "flex justify-center border p-2 cursor-pointer",
                  )}
                  key={interest.interest_id}
                  onClick={() => {
                    if (
                      selectedInterests.some(
                        (selected) =>
                          selected.interest_id === interest.interest_id,
                      )
                    ) {
                      if (props.value.length === 1) {
                        setErr("Atleast 1 interest should be selected");
                      } else {
                        setSelectedInterests(
                          selectedInterests.filter(
                            (i) => i.interest_id !== interest.interest_id,
                          ),
                        );
                        setErr(null);
                      }
                    } else {
                      if (selectedInterests.length < props.SelectCount) {
                        // add interest
                        setSelectedInterests([...selectedInterests, interest]);
                        setErr(null);
                      } else {
                        setErr(
                          `Atmost ${props.SelectCount} interests can be selected`,
                        );
                      }
                    }
                  }}
                >
                  {interest.interest_name}
                </span>
              ))}
          </div>
          <ScrollBar orientation={"vertical"} />
        </ScrollArea>
        {err && <span className="text-red-500">{err}</span>}
        <DialogClose onClick={handleSubmission}>
          <span
            className={cn(
              theme_border,
              hover_style,
              "flex justify-center p-2 cursor-pointer",
            )}
          >
            Done
          </span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddInterestBtn;
