"use client";
import {
  getGroupSessionParticipants,
  getGroupSessionsById,
} from "@/app/lib/fetchers";
import { GroupSessionInfoType, GroupSessionParticipantInfo } from "@/app/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { minutesToHours } from "@/app/utils/utility";
import { ChevronLeft, Clock, Hourglass } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { smooth_hover } from "@/app/ui/CustomStyles";
import {
  cancelGroupSession,
  deleteGroupSession,
  joinGroupSession,
} from "@/app/lib/mutations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { toast } from "sonner";

const GroupSessionPageIndividual = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType | null>(null);
  const [reg, setReg] = useState<boolean>(false);
  const [participants, setParticipants] = useState<
    GroupSessionParticipantInfo[]
  >([]);
  const router = useRouter();
  const studentId = localStorage.getItem("student-id");
  if (!studentId) {
    router.replace("/sign-in");
  }
  const params = useParams();
  const gsid = params.gsid as string;
  const searchParams = useSearchParams();
  const bg = searchParams.get("bg");
  const text = searchParams.get("text");
  const handleDeleteGroupSession = async () => {
    const res = await deleteGroupSession(gsid);
    if (res) {
      toast.success("Group session deleted successfully");
      router.replace("/m/group-sessions");
    } else {
      toast.error("Group Session could not be deleted");
    }
  };
  const handleEditGroupSession = async () => {};

  useEffect(() => {
    const fn = async () => {
      const data: GroupSessionInfoType = await getGroupSessionsById(gsid);
      setGsInfo(data);
      const p: GroupSessionParticipantInfo[] =
        await getGroupSessionParticipants(gsid);
      setParticipants(p);

      if (p.some((p) => p.id === studentId && p.status === "registered")) {
        setReg(true);
      }
    };
    fn();
  }, []);

  return (
    <div>
      {gsInfo && (
        <div
          className={cn(
            bg,
            "relative h-[400px] flex flex-col justify-center items-center",
          )}
        >
          <Link href={"/m/group-sessions"}>
            <div className="absolute z-10 top-0 left-0 p-5  hover:opacity-50 select-none ">
              <ChevronLeft />
            </div>
          </Link>
          <span className="flex  items-center font-semibold gap-x-2 ">
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-white">
              <Image
                src={gsInfo.mentor.photoLink}
                alt=""
                width={50}
                height={50}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            {gsInfo.mentor.name}
          </span>
          <span className={cn(text, "text-6xl font-black ")}>
            {gsInfo.title}
          </span>
          <span className="flex  gap-x-4 font-semiboldi my-4">
            <span className="flex gap-x-2">
              <Hourglass />
              {minutesToHours(gsInfo.durationInMinutes)}
            </span>
            <span className="flex gap-x-2">
              <Clock />
              {format(gsInfo.startTime, "PPp")}
            </span>
          </span>
        </div>
      )}
      <div className=" flex flex-col items-center my-10">
        <Dialog>
          <DialogTrigger>
            <span className="select-none bg-red-700 px-2 py-1 rounded-lg hover:opacity-70">
              Delete Group Session
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-xl">
              {" "}
              Are you sure about that ?
            </DialogTitle>
            <div className="flex gap-x-2">
              <DialogClose
                className="w-[150px] p-2 bg-zinc-800 flex justify-center rounded-sm hover:opacity-90"
                onClick={handleDeleteGroupSession}
              >
                Yes
              </DialogClose>
              <DialogClose
                className="w-[150px] p-2 bg-red-800 flex justify-center rounded-sm hover:opacity-90"
                onClick={handleEditGroupSession}
              >
                No
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <span className="flex gap-x-2">
          {reg && gsInfo && (
            <Link href={gsInfo.platform_link} target="_blank">
              <span
                className={cn(
                  "flex gap-x-2 items-center font-semibold px-5 rounded-md py-2",
                  bg,
                  smooth_hover,
                  "hover:opacity-70",
                )}
              >
                <Image
                  src={"/meet.png"}
                  alt="meet logo"
                  width={30}
                  height={30}
                />{" "}
                Join The Meeting
              </span>
            </Link>
          )}

          {reg && (
            <Dialog>
              <DialogTrigger>
                <span
                  className={cn(
                    "flex gap-x-2 items-center font-semibold px-5 rounded-md py-2 h-full bg-red-800",
                    smooth_hover,
                    "hover:opacity-70",
                  )}
                >
                  Cancel My Participation
                </span>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="text-xl">
                  Are you sure about cancelling your seat?
                </DialogTitle>
                <div className="flex gap-x-2 w-full">
                  <DialogClose className="w-[150px] p-2 bg-red-800 flex justify-center rounded-sm hover:opacity-90">
                    Yes
                  </DialogClose>
                  <DialogClose className="w-[150px] p-2 bg-gray-700 flex justify-center rounded-sm hover:opacity-90">
                    Cancel
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </span>
        <span>
          <Table className=" my-10 text-lg p-2 rounded-xl  ">
            <TableHeader className="p-10">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registered At</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            {participants.map((p, i) => {
              if (p.status !== "cancelled") {
                return (
                  <TableBody key={i}>
                    <TableRow>
                      <TableCell className="flex  items-center gap-x-2 ">
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden ">
                          {p.photoLink.length > 0 && (
                            <Image
                              src={p.photoLink}
                              alt=""
                              width={50}
                              height={50}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          )}
                        </div>
                        <span>{p.name}</span>
                        {p.status === "waiting" && (
                          <span className={cn(bg, "text-sm px-2 rounded-full")}>
                            waiting
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{format(p.joinedAt, "PPp")}</TableCell>
                      <TableCell>{p.points}</TableCell>
                      <TableCell>{p.status}</TableCell>
                    </TableRow>
                  </TableBody>
                );
              }
            })}
          </Table>
        </span>
        {reg && (
          <Dialog>
            <DialogTrigger>
              <span className="p-2 rounded-md bg-red-800 hover:opacity-70 font-semibold">
                Cancel My Participation
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="text-xl">
                Are you sure about cancelling your seat?
              </DialogTitle>
              <div className="flex gap-x-2 w-full">
                <DialogClose className="w-[150px] p-2 bg-red-800 flex justify-center rounded-sm hover:opacity-90">
                  Yes
                </DialogClose>
                <DialogClose className="w-[150px] p-2 bg-gray-700 flex justify-center rounded-sm hover:opacity-90">
                  Cancel
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default GroupSessionPageIndividual;
