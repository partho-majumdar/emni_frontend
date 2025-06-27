"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Calendar, Clock, Coins, Users, Check, X, ArrowLeft, RefreshCw } from "lucide-react";
import Image from "next/image";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error("Invalid date format");
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid Date";
  }
};

const formatUTCDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error("Invalid date format");
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC"
    });
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid Date";
  }
};

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
  poster_student_id?: string;
  poster_mentor_id?: string;
  participants: Array<{
    user_id: string;
    name: string;
    username: string;
    user_type: string;
    student_id?: string;
    mentor_id?: string;
  }>;
  applications: Array<{
    application_id: string;
    job_id: string;
    applicant_id: string;
    description: string;
    email: string;
    phone_number: string;
    status: string;
    applied_at: string;
    applicant_name: string;
    applicant_username: string;
    applicant_email: string;
    applicant_user_type: string;
    student_id?: string;
    mentor_id?: string;
  }>;
  isOwner: boolean;
}

const getAvatar = (username: string): string => {
  return `https://robohash.org/${username}.png?size=200x200`;
};

const JobDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = Array.isArray(params.jobid) ? params.jobid[0] : params.jobid;

  const [job, setJob] = useState<JobPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    console.log("Params from useParams:", params);
    console.log("Extracted jobId:", jobId);
  }, [params, jobId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStudentId = localStorage.getItem("student-id");
      if (!storedStudentId) {
        toast.error("Please log in as a student to access this page");
        router.push("/sign-in");
        setIsLoading(false);
        return;
      }
      setStudentId(storedStudentId);
    }
  }, [router]);

  const fetchJobDetails = async () => {
    console.log("Fetching job details for jobId:", jobId);
    if (!studentId) {
      setError("Please log in as a student to access this page");
      setIsLoading(false);
      return;
    }
    if (!jobId) {
      console.warn("Invalid or missing jobId, redirecting to /s/jobs");
      setError("Invalid or missing job ID");
      setIsLoading(false);
      router.push("/s/jobs");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest({
        endpoint: `api/student/jobs/${jobId}`,
        method: "GET",
        auth: true,
      });

      if (res.success) {
        setJob(res.data);
      } else {
        throw new Error(res.message || "Failed to fetch job details");
      }
    } catch (err: any) {
      console.error("Fetch job details error:", err);
      setError(err.message || "Failed to fetch job details");
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchJobDetails, 2000);
      } else {
        toast.error(err.message || "Error fetching job details");
      }
    } finally {
      if (retryCount >= maxRetries || !error) {
        setIsLoading(false);
      }
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: "Accepted" | "Rejected") => {
    if (!studentId || !jobId) {
      toast.error("Please log in as a student to access this page");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: `api/student/jobs/${jobId}/applications/${applicationId}`,
        method: "PUT",
        body: { status },
        auth: true,
      });
      if (res.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        await fetchJobDetails();
      } else {
        throw new Error(res.message || `Failed to ${status.toLowerCase()} application`);
      }
    } catch (err: any) {
      console.error("Application status update error:", err);
      toast.error(err.message || `Error ${status.toLowerCase()} application`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!studentId || !jobId) {
      toast.error("Please log in as a student to access this page");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        endpoint: `api/student/jobs/${jobId}/complete`,
        method: "POST",
        auth: true,
      });
      if (res.success) {
        toast.success("Job completed successfully");
        await fetchJobDetails();
      } else {
        throw new Error(res.message || "Failed to complete job");
      }
    } catch (err: any) {
      console.error("Complete job error:", err);
      toast.error(err.message || "Error completing job");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current time is after job end_date
  const isJobCompletable = () => {
    if (!job || !job.end_date) return false;
    const currentTime = new Date();
    const endDate = new Date(job.end_date);
    return currentTime > endDate;
  };

  useEffect(() => {
    if (!jobId) {
      console.warn("jobId is undefined, redirecting to /s/jobs");
      setError("Missing job ID");
      setIsLoading(false);
      router.push("/s/jobs");
      return;
    }
    if (studentId) {
      fetchJobDetails();
    }
  }, [studentId, jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="text-center text-white">
          <h3 className="text-xl font-bold">Job Not Found</h3>
          <p className="text-slate-400 text-sm mt-2">{error || "The requested job could not be found."}</p>
          <div className="flex space-x-4 mt-4">
            <Button
              onClick={() => router.push("/s/jobs")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl h-12 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              Back to Jobs
            </Button>
            {retryCount < maxRetries && (
              <Button
                onClick={() => {
                  setRetryCount(0);
                  fetchJobDetails();
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-12 transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push("/s/jobs")}
                className="bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl h-12 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            </div>
            {job.isOwner && job.status === "Open" && (
              <Button
                onClick={handleCompleteJob}
                disabled={isSubmitting || job.participant_count === 0 || !isJobCompletable()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Completing...</span>
                  </div>
                ) : (
                  "Complete Job"
                )}
              </Button>
            )}
          </div>

          {/* Job Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Job Details</h2>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  job.status === 'Open' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : job.status === 'Completed'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
                }`}>
                  {job.status}
                </div>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-6">{job.description || "No description provided"}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Calendar className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Start Date</p>
                      <p className="font-medium text-sm">{formatDate(job.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Calendar className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">End Date</p>
                      <p className="font-medium text-sm">{formatDate(job.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Application Deadline</p>
                      <p className="font-medium text-sm">{formatDate(job.application_deadline)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Coins className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">uCoin Reward</p>
                      <p className="font-medium text-sm">{job.ucoin_reward} uCoins</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Max Participants</p>
                      <p className="font-medium text-sm">{job.max_participants}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Current Participants</p>
                      <p className="font-medium text-sm">{job.participant_count}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Posted By</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Image
                      src={getAvatar(job.poster_username || "unknown")}
                      alt={`${job.poster_username || "Unknown"}'s avatar`}
                      width={48}
                      height={48}
                      className="rounded-xl border-2 border-orange-500/50 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{job.poster_name || "Unknown"}</p>
                    <p className="text-xs text-slate-400">@{job.poster_username || "unknown"}</p>
                    <p className="text-xs text-slate-400">{job.poster_user_type || "N/A"}</p>
                    <p className="text-xs text-slate-500">{job.poster_email || "No email"}</p>
                    {job.poster_student_id && (
                      <p className="text-xs text-slate-500">ID: {job.poster_student_id}</p>
                    )}
                    {job.poster_mentor_id && (
                      <p className="text-xs text-slate-500">Mentor ID: {job.poster_mentor_id}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Participants Section */}
          {job.participants && job.participants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Participants ({job.participant_count})</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.participants.map((participant) => (
                    <div key={participant.user_id} className="flex items-center space-x-4 p-3 bg-slate-800/30 rounded-xl">
                      <div className="relative">
                        <Image
                          src={getAvatar(participant.username || "unknown")}
                          alt={`${participant.username || "Unknown"}'s avatar`}
                          width={40}
                          height={40}
                          className="rounded-xl border-2 border-orange-500/50 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{participant.name || "Unknown"}</p>
                        <p className="text-xs text-slate-400">@{participant.username || "unknown"}</p>
                        <p className="text-xs text-slate-400">{participant.user_type || "N/A"}</p>
                        {participant.student_id && (
                          <p className="text-xs text-slate-500">ID: {participant.student_id}</p>
                        )}
                        {participant.mentor_id && (
                          <p className="text-xs text-slate-500">Mentor ID: {participant.mentor_id}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Applications Section */}
          {job.isOwner && job.applications && job.applications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Applications ({job.application_count})</h2>
                </div>
                
                <div className="space-y-4">
                  {job.applications.map((application) => (
                    <div
                      key={application.application_id}
                      className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <Image
                              src={getAvatar(application.applicant_username || "unknown")}
                              alt={`${application.applicant_username || "Unknown"}'s avatar`}
                              width={40}
                              height={40}
                              className="rounded-xl border-2 border-orange-500/50 shadow-md"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{application.applicant_name || "Unknown"}</p>
                            <p className="text-xs text-slate-400">@{application.applicant_username || "unknown"}</p>
                            <p className="text-xs text-slate-400">{application.applicant_user_type || "N/A"}</p>
                            <p className="text-xs text-slate-500">{application.applicant_email || "No email"}</p>
                            <p className="text-xs text-slate-500">{application.phone_number || "No phone number"}</p>
                            {application.student_id && (
                              <p className="text-xs text-slate-500">ID: {application.student_id}</p>
                            )}
                            {application.mentor_id && (
                              <p className="text-xs text-slate-500">Mentor ID: {application.mentor_id}</p>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'Accepted'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : application.status === 'Rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
                        }`}>
                          {application.status}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-slate-300">{application.description || "No description provided"}</p>
                        <p className="text-xs text-slate-400 mt-2">Applied: {formatUTCDate(application.applied_at)}</p>
                      </div>
                      
                      {application.status === "Pending" && (
                        <div className="flex space-x-3 mt-4">
                          <Button
                            onClick={() => handleApplicationStatus(application.application_id, "Accepted")}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-10 transition-all duration-200 shadow-md hover:shadow-green-500/25"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleApplicationStatus(application.application_id, "Rejected")}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl h-10 transition-all duration-200 shadow-md hover:shadow-red-500/25"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default JobDetailsPage;
  