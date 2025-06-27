"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Trash2, Edit3, Calendar, Coins, Users, Clock, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JobPost {
  job_id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  application_deadline: string;
  ucoin_reward: number;
  max_participants: number;
  status: string;
  created_at: string;
  application_count: number;
  participant_count: number;
  poster_name: string;
  poster_username: string;
  poster_email: string;
  poster_user_type: string;
  poster_mentor_id?: string;
}

export function getAvatar(username: string): string {
  return `https://robohash.org/${username}.png?size=200x200`;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
};

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const MentorJobsPage: React.FC = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    application_deadline: "",
    ucoin_reward: "",
    max_participants: "",
  });
  const [editJobForm, setEditJobForm] = useState({
    job_id: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    application_deadline: "",
    ucoin_reward: "",
    max_participants: "",
    status: "",
  });
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMentorId = localStorage.getItem("mentor-id");
      if (!storedMentorId) {
        toast.error("Please log in as a mentor to access this page");
        router.push("/sign-in");
        return;
      }
      setMentorId(storedMentorId);
    }
  }, [router]);

  const fetchJobs = useCallback(async () => {
    if (!mentorId) {
      throw new Error("Please log in as a mentor to access this page");
    }
    setIsLoading(true);
    try {
      const res = await apiRequest({
        endpoint: "api/mentor/jobs/my-jobs",
        method: "GET",
        auth: true,
      });
      if (res.success) {
        setJobs(res.data);
        setFilteredJobs(res.data);
      } else {
        throw new Error(res.message || "Failed to fetch jobs");
      }
    } catch (err) {
      toast.error("Error fetching jobs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [mentorId]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const lowerTerm = term.toLowerCase();
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerTerm) ||
          job.description.toLowerCase().includes(lowerTerm)
      );
      setFilteredJobs(filtered);
    }
  };

  const handleCreateJob = async () => {
    if (!mentorId) {
      toast.error("Please log in as a mentor to access this page");
      return;
    }
    const {
      title,
      description,
      start_date,
      end_date,
      application_deadline,
      ucoin_reward,
      max_participants,
    } = jobForm;
    if (
      !title ||
      !description ||
      !start_date ||
      !end_date ||
      !application_deadline ||
      !ucoin_reward ||
      !max_participants
    ) {
      toast.error("All fields are required");
      return;
    }
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const deadlineDate = new Date(application_deadline);
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      isNaN(deadlineDate.getTime())
    ) {
      toast.error("Invalid date format");
      return;
    }
    if (startDate >= endDate || deadlineDate >= startDate) {
      toast.error("Invalid date order");
      return;
    }
    if (Number(ucoin_reward) <= 0 || Number(max_participants) <= 0) {
      toast.error("Reward and participants must be positive");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: "api/mentor/jobs",
        method: "POST",
        body: {
          title,
          description,
          start_date,
          end_date,
          application_deadline,
          ucoin_reward: Number(ucoin_reward),
          max_participants: Number(max_participants),
        },
        auth: true,
      });
      if (res.success) {
        toast.success("Job created successfully");
        setJobForm({
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          application_deadline: "",
          ucoin_reward: "",
          max_participants: "",
        });
        await fetchJobs();
      } else {
        throw new Error(res.message || "Failed to create job");
      }
    } catch (err) {
      toast.error("Error creating job");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = (job: JobPost) => {
    setEditingJobId(job.job_id);
    setEditJobForm({
      job_id: job.job_id,
      title: job.title,
      description: job.description,
      start_date: formatDateForInput(job.start_date),
      end_date: formatDateForInput(job.end_date),
      application_deadline: formatDateForInput(job.application_deadline),
      ucoin_reward: job.ucoin_reward.toString(),
      max_participants: job.max_participants.toString(),
      status: job.status,
    });
  };

  const handleUpdateJob = async () => {
    if (!mentorId) {
      toast.error("Please log in as a mentor to access this page");
      return;
    }
    const {
      job_id,
      title,
      description,
      start_date,
      end_date,
      application_deadline,
      ucoin_reward,
      max_participants,
      status,
    } = editJobForm;
    if (
      !title ||
      !description ||
      !start_date ||
      !end_date ||
      !application_deadline ||
      !ucoin_reward ||
      !max_participants
    ) {
      toast.error("All fields are required");
      return;
    }
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const deadlineDate = new Date(application_deadline);
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      isNaN(deadlineDate.getTime())
    ) {
      toast.error("Invalid date format");
      return;
    }
    if (startDate >= endDate || deadlineDate >= startDate) {
      toast.error("Invalid date order");
      return;
    }
    if (Number(ucoin_reward) <= 0 || Number(max_participants) <= 0) {
      toast.error("Reward and participants must be positive");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: `api/mentor/jobs/${job_id}`,
        method: "PUT",
        body: {
          title,
          description,
          start_date,
          end_date,
          application_deadline,
          ucoin_reward: Number(ucoin_reward),
          max_participants: Number(max_participants),
          status,
        },
        auth: true,
      });
      if (res.success) {
        toast.success("Job updated successfully");
        setEditingJobId(null);
        setEditJobForm({
          job_id: "",
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          application_deadline: "",
          ucoin_reward: "",
          max_participants: "",
          status: "",
        });
        await fetchJobs();
      } else {
        throw new Error(res.message || "Failed to update job");
      }
    } catch (err) {
      toast.error("Error updating job");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!mentorId) {
      toast.error("Please log in as a mentor to access this page");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: `api/mentor/jobs/${jobId}`,
        method: "DELETE",
        auth: true,
      });
      if (res.success) {
        toast.success("Job deleted successfully");
        await fetchJobs();
      } else {
        throw new Error(res.message || "Failed to delete job");
      }
    } catch (err) {
      toast.error("Error deleting job");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    if (!mentorId) {
      toast.error("Please log in as a mentor to access this page");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: `api/mentor/jobs/${jobId}/complete`,
        method: "POST",
        auth: true,
      });
      if (res.success) {
        toast.success("Job completed successfully");
        await fetchJobs();
      } else {
        throw new Error(res.message || "Failed to complete job");
      }
    } catch (err) {
      toast.error("Error completing job");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateApplicationStatus = async (jobId: string, applicationId: string, status: "Accepted" | "Rejected") => {
    if (!mentorId) {
      toast.error("Please log in as a mentor to access this page");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: `api/mentor/jobs/${jobId}/applications/${applicationId}`,
        method: "PUT",
        body: { status },
        auth: true,
      });
      if (res.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        await fetchJobs();
      } else {
        throw new Error(res.message || `Failed to ${status.toLowerCase()} application`);
      }
    } catch (err) {
      toast.error(`Error ${status.toLowerCase()} application`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (mentorId) {
      fetchJobs();
    }
  }, [fetchJobs, mentorId]);

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-transparent border-b border-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg" />
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-md">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Mentor Jobs Hub
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Create and manage your job opportunities
                  </p>
                </div>
              </div>
              <div className="relative w-64">
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-400 rounded-xl h-10 pl-10 pr-4 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Create Job Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <h2 className="text-xl font-bold text-white">Create New Opportunity</h2>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="Job Title"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-400 rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                />
                <Textarea
                  placeholder="Job Description"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-400 rounded-lg p-3 min-h-[100px] focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                  rows={4}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Start Date</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={jobForm.start_date}
                      onChange={(e) => setJobForm({ ...jobForm, start_date: e.target.value })}
                      className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>End Date</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={jobForm.end_date}
                      onChange={(e) => setJobForm({ ...jobForm, end_date: e.target.value })}
                      className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Application Deadline</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={jobForm.application_deadline}
                    onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })}
                    className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                      <Coins className="w-3 h-3" />
                      <span>uCoin Reward</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter reward amount"
                      value={jobForm.ucoin_reward}
                      onChange={(e) => setJobForm({ ...jobForm, ucoin_reward: e.target.value })}
                      className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Max Participants</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter max participants"
                      value={jobForm.max_participants}
                      onChange={(e) => setJobForm({ ...jobForm, max_participants: e.target.value })}
                      className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateJob}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg h-10 transition-all duration-200 shadow-md hover:shadow-orange-500/25"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Job"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-2 flex justify-center py-16">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-orange-300 rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }} />
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-transparent rounded-2xl blur-xl" />
                  <div className="relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No jobs created yet
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Create your first job opportunity above
                    </p>
                  </div>
                </motion.div>
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                  <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-slate-600/50">
                    {/* Job Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-200">
                        {job.title}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Open' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : job.status === 'Closed'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
                      }`}>
                        {job.status}
                      </div>
                    </div>
                    {/* Job Description */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">{job.description}</p>
                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">Start</p>
                            <p className="font-medium text-xs">{formatDate(job.start_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">End</p>
                            <p className="font-medium text-xs">{formatDate(job.end_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">Deadline</p>
                            <p className="font-medium text-xs">{formatDate(job.application_deadline)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">Reward</p>
                            <p className="font-medium text-xs">{job.ucoin_reward} uCoins</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">Participants</p>
                            <p className="font-medium text-xs">{job.participant_count}/{job.max_participants}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">Applications</p>
                            <p className="font-medium text-xs">{job.application_count}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => router.push(`/m/jobs/${job.job_id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-blue-500/25"
                      >
                        Details
                      </Button>
                      <Dialog
                        open={editingJobId === job.job_id}
                        onOpenChange={(open) => {
                          if (!open) setEditingJobId(null);
                          else handleEditJob(job);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            disabled={job.status !== "Open"}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-yellow-500/25"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 text-white rounded-2xl max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Edit Job</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                <span>Job Title</span>
                              </label>
                              <Input
                                placeholder="Job title"
                                value={editJobForm.title}
                                onChange={(e) =>
                                  setEditJobForm({ ...editJobForm, title: e.target.value })
                                }
                                className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                <span>Job Description</span>
                              </label>
                              <Textarea
                                placeholder="Job description"
                                value={editJobForm.description}
                                onChange={(e) =>
                                  setEditJobForm({ ...editJobForm, description: e.target.value })
                                }
                                className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg p-3 min-h-[100px] focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                                rows={4}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Start Date</span>
                                </label>
                                <Input
                                  type="datetime-local"
                                  value={editJobForm.start_date}
                                  onChange={(e) =>
                                    setEditJobForm({ ...editJobForm, start_date: e.target.value })
                                  }
                                  className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>End Date</span>
                                </label>
                                <Input
                                  type="datetime-local"
                                  value={editJobForm.end_date}
                                  onChange={(e) =>
                                    setEditJobForm({ ...editJobForm, end_date: e.target.value })
                                  }
                                  className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                <Clock className="w-3 h-3" />
                                <span>Application Deadline</span>
                              </label>
                              <Input
                                type="datetime-local"
                                value={editJobForm.application_deadline}
                                onChange={(e) =>
                                  setEditJobForm({
                                    ...editJobForm,
                                    application_deadline: e.target.value,
                                  })
                                }
                                className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                  <Coins className="w-3 h-3" />
                                  <span>uCoin Reward</span>
                                </label>
                                <Input
                                  type="number"
                                  placeholder="uCoin reward"
                                  value={editJobForm.ucoin_reward}
                                  onChange={(e) =>
                                    setEditJobForm({ ...editJobForm, ucoin_reward: e.target.value })
                                  }
                                  className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1 mb-1">
                                  <Users className="w-3 h-3" />
                                  <span>Max Participants</span>
                                </label>
                                <Input
                                  type="number"
                                  placeholder="Max participants"
                                  value={editJobForm.max_participants}
                                  onChange={(e) =>
                                    setEditJobForm({
                                      ...editJobForm,
                                      max_participants: e.target.value,
                                    })
                                  }
                                  className="bg-slate-900/50 border border-slate-700/50 text-white rounded-lg h-10 px-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button
                              onClick={() => setEditingJobId(null)}
                              className="bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-slate-500/25"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateJob}
                              disabled={isSubmitting}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-blue-500/25"
                            >
                              {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                "Update Job"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            disabled={job.status !== "Open"}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-red-500/25"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 text-white rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Delete Job</DialogTitle>
                            <DialogDescription className="text-slate-300">
                              Are you sure you want to delete this job? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <Button
                              onClick={() => {}}
                              className="bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-slate-500/25"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleDeleteJob(job.job_id)}
                              disabled={isSubmitting}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-red-500/25"
                            >
                              {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Deleting...</span>
                                </div>
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default MentorJobsPage;
