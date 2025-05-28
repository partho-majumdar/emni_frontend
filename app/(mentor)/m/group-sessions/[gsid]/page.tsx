"use client";

import { getGroupSessionParticipants, getGroupSessionsById } from "@/app/lib/fetchers";
import { deleteGroupSession } from "@/app/lib/mutations/mentor";
import { GroupSessionInfoType, GroupSessionParticipantInfo } from "@/app/types";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { minutesToHours } from "@/app/utils/utility";
import { ChevronLeft, Clock, Hourglass, Edit, Trash2, Users, Video, TrendingUp, PieChart as PieChartIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import EditGroupSession from "@/app/ui/EditGroupSession";
import { toast } from "sonner";
import Image from "next/image";
import { format, subDays, startOfDay, isAfter, isEqual, eachDayOfInterval } from "date-fns";
import { jakarta } from "@/app/utils/font";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";

const GroupSessionPageIndividual = () => {
  const [gsInfo, setGsInfo] = useState<GroupSessionInfoType | null>(null);
  const [participants, setParticipants] = useState<GroupSessionParticipantInfo[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const router = useRouter();
  const params = useParams();
  const gsid = params.gsid as string;

  useEffect(() => {
    const fetchData = async () => {
      const mID = localStorage.getItem("mentor-id");
      if (!mID) {
        toast.error("Mentor ID not found. Please sign in.");
        router.push("/sign-in");
        return;
      }
      try {
        const data: GroupSessionInfoType = await getGroupSessionsById(gsid);
        setGsInfo({
          ...data,
          startTime: new Date(data.startTime),
        });
        const p: GroupSessionParticipantInfo[] = await getGroupSessionParticipants(gsid);
        setParticipants(p);
      } catch (error) {
        toast.error("Failed to fetch group session details.");
        console.error(error);
        router.push("/m/group-sessions");
      }
    };
    fetchData();
  }, [gsid, router]);

  const handleDeleteGroupSession = async () => {
    try {
      const res = await deleteGroupSession(gsid);
      if (res.success) {
        toast.success("Group session deleted successfully.");
        router.push("/m/group-sessions");
      } else {
        toast.error(res.error || "Failed to delete group session.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleUpdateSession = (updatedSession: GroupSessionInfoType) => {
    setGsInfo(updatedSession);
  };

  const filteredParticipants = useMemo(() => {
    if (dateFilter === "all") return participants;

    const now = new Date();
    const filterDate = dateFilter === "today" ? startOfDay(now) :
                      dateFilter === "7days" ? subDays(now, 7) :
                      dateFilter === "30days" ? subDays(now, 30) :
                      subDays(now, 90);

    return participants.filter(p => 
      isAfter(new Date(p.joinedAt), filterDate) || 
      isEqual(new Date(p.joinedAt), filterDate)
    );
  }, [participants, dateFilter]);

  const registrationTrend = useMemo(() => {
    if (filteredParticipants.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (dateFilter) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "90days":
        startDate = subDays(now, 90);
        break;
      default:
        const allDates = participants.map(p => new Date(p.joinedAt));
        startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        endDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    }

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const registrationCounts = new Map<string, number>();
    filteredParticipants.forEach(participant => {
      const joinDate = new Date(participant.joinedAt);
      const dateKey = format(joinDate, "yyyy-MM-dd");
      registrationCounts.set(dateKey, (registrationCounts.get(dateKey) || 0) + 1);
    });

    return dateRange.map(date => ({
      date: dateFilter === "today" ? format(date, "HH:mm") : format(date, "MMM dd"),
      reg: registrationCounts.get(format(date, "yyyy-MM-dd")) || 0,
      fullDate: date
    })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [filteredParticipants, dateFilter, participants]);

  const statusDistribution = useMemo(() => {
    if (!gsInfo) return [];
    
    const registered = participants.filter(p => p.status === "registered").length;
    const waiting = participants.filter(p => p.status === "waiting").length;
    const maxParticipants = gsInfo.participants.max;
    const remaining = Math.max(0, maxParticipants - (registered + waiting));
    
    const total = maxParticipants || 1;
    const registeredPct = (registered / total) * 100;
    const waitingPct = (waiting / total) * 100;
    const remainingPct = (remaining / total) * 100;

    return [
      { name: "Registered", count: registered, value: registeredPct, color: "#10b981" },
      { name: "Waiting", count: waiting, value: waitingPct, color: "#f59e0b" },
      { name: "Remaining", count: remaining, value: remainingPct, color: "#6B7280" },
    ];
  }, [participants, gsInfo]);

  const activeParticipants = participants.filter(p => p.status !== "cancelled");

  return (
    <ScrollArea className="h-screen w-full">
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 p-4 md:p-8">
        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) rgba(17, 24, 39, 0.5);
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.5);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.7);
          }
        `}</style>

        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          {gsInfo && (
            <>
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <Link href="/m/group-sessions">
                    <Button variant="ghost" className="text-gray-300 hover:text-orange-400 hover:bg-orange-500/10">
                      <ChevronLeft className="mr-2" />
                      Back to Sessions
                    </Button>
                  </Link>
                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenEditDialog(true)}
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                        >
                          <Edit size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Session</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenDeleteDialog(true)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Session</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-4 space-y-6">
                  <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                    <h1 className={`${jakarta.className} text-3xl font-bold text-white mb-6`}>
                      {gsInfo.title}
                    </h1>
                    <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-xl">
                      <Image
                        src={gsInfo.mentor.photoLink}
                        alt={gsInfo.mentor.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                        unoptimized
                      />
                      <div>
                        <h3 className="text-white font-bold">{gsInfo.mentor.name}</h3>
                        <p className="text-orange-400 text-sm">Session Mentor</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <Hourglass size={20} className="text-white" />
                        <div>
                          <p className="text-gray-400 text-sm">Duration</p>
                          <p className="text-white font-semibold">{minutesToHours(gsInfo.durationInMinutes)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <Clock size={20} className="text-white" />
                        <div>
                          <p className="text-gray-400 text-sm">Start Time</p>
                          <p className="text-white font-semibold">{format(gsInfo.startTime, "PPp")}</p>
                        </div>
                      </div>
                      <div className="p-6 bg-white/5 rounded-xl">
                        <h4 className="text-white font-semibold mb-3">Description</h4>
                        <p className="text-gray-300">{gsInfo.description}</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Users size={20} className="text-gray-400" />
                          <div>
                            <p className="text-white font-semibold">
                              {gsInfo.participants.current}/{gsInfo.participants.max}
                            </p>
                            <p className="text-gray-400 text-sm">Participants</p>
                          </div>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                          <a href={gsInfo.platform_link} target="_blank" rel="noopener noreferrer">
                            <Video size={18} className="mr-2" />
                            Join Meeting
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-6 rounded-2xl shadow-2xl border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <PieChartIcon size={20} />
                      Registration Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64">
                        <BarChart
                          data={statusDistribution.map(item => ({
                            status: item.name,
                            count: item.count,
                          }))}
                          index="status"
                          categories={["count"]}
                          colors={statusDistribution.map(item => item.color)}
                          showLegend={false}
                          layout="vertical"
                          valueFormatter={(value) => `${value} people`}
                          className="text-gray-400"
                        />
                      </div>
                      <div className="h-64">
                        <PieChart
                          data={statusDistribution}
                          colors={statusDistribution.map(item => item.color)}
                          showLegend={true}
                          valueFormatter={(value) => `${Math.round(value)}%`}
                          className="text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-center text-gray-500 text-sm">
                      Total Participants: {gsInfo.participants.current}/{gsInfo.participants.max}
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-8 space-y-6">
                  <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl shadow-2xl border border-gray-700/50">
                    <div className="p-6 border-b border-gray-700/50">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} />
                        Active Participants
                      </h2>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      <Table className="text-gray-300">
                        <TableHeader className="sticky top-0 bg-gray-900/50">
                          <TableRow className="hover:bg-transparent border-gray-600/50">
                            <TableHead className="text-gray-300 font-semibold py-4">Student</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Email</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Registered</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeParticipants.map((p, i) => (
                            <TableRow key={i} className="border-gray-600/30 hover:bg-white/5">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={p.photoLink || ''}
                                    alt={p.name || 'Participant'}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                    unoptimized
                                  />
                                  <span className="font-semibold text-white">{p.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-400 py-3">{p.email}</TableCell>
                              <TableCell className="text-gray-400 py-3">
                                {format(new Date(p.joinedAt), "MMM d, yyyy 'at' HH:mm")}
                              </TableCell>
                              <TableCell className="py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                    p.status === "registered"
                                      ? "bg-green-900/20 text-green-300"
                                      : "bg-amber-900/20 text-orange-300"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-6 rounded-xl shadow-2xl border border-gray-700/50">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} />
                        Daily Registration Trend
                      </h3>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600/50 text-gray-200">
                          <Filter size={16} className="mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="7days">Last 7 Days</SelectItem>
                          <SelectItem value="30days">Last 30 Days</SelectItem>
                          <SelectItem value="90days">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="h-80">
                      {registrationTrend.length > 0 ? (
                        <LineChart
                          data={registrationTrend}
                          index="date"
                          categories={["reg"]}
                          colors={["#f97316"]}
                          showLegend={false}
                          curveType="monotone"
                          valueFormatter={(value) => `${Math.round(value)} people`}
                          className="text-gray-400"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 text-lg">No registration data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {openEditDialog && gsInfo && (
                <Dialog open onOpenChange={() => setOpenEditDialog(false)}>
                  <DialogContent className="bg-gray-900/95 border border-gray-700/80 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl font-bold">Edit Group Session</DialogTitle>
                    </DialogHeader>
                    <EditGroupSession
                      GroupSessionDetails={gsInfo}
                      onClose={() => setOpenEditDialog(false)}
                      onUpdate={handleUpdateSession}
                    />
                  </DialogContent>
                </Dialog>
              )}
              {openDeleteDialog && (
                <Dialog open onOpenChange={() => setOpenDeleteDialog(false)}>
                  <DialogContent className="bg-gray-900/95 border border-gray-700/80">
                    <DialogHeader>
                      <DialogTitle className="text-white text-red-600">Delete Group Session</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-300 mb-6">Are you sure you want to delete this group session?</p>
                    <div className="flex gap-3">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold flex-1"
                        onClick={handleDeleteGroupSession}
                      >
                        Yes, Delete
                      </Button>
                      <Button
                        className="border-gray-500 text-gray-300 hover:bg-gray-700/50 flex-1"
                        onClick={() => setOpenDeleteDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default GroupSessionPageIndividual;