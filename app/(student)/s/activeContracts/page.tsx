"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Calendar, Coins, Users, Clock } from "lucide-react";
import Image from "next/image";

interface ApplicantInfo {
  name: string;
  username: string;
  system_email: string;
  provided_email: string;
  phone_number: string;
  user_type: string;
  gender: string | null;
  dob: string | null;
  graduation_year: number | null;
  student_id: string | null;
  mentor_id: string | null;
  ucoin_balance: number | null;
}

interface ApplicationDetails {
  description: string;
  applied_at: string;
  status: string;
}

interface PostedJob {
  job_details: {
    job_id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    application_deadline: string;
    ucoin_reward: number;
    max_participants: number;
    status: string;
    job_type: string;
    created_at: string;
    participant_count: number;
    hired_count: number;
    poster_info: {
      name: string;
      username: string;
      email: string;
      user_type: string;
      student_id: string | null;
      mentor_id: string | null;
    };
  };
  hired_applicants: {
    application_id: string;
    applicant_info: ApplicantInfo;
    application_details: ApplicationDetails;
  }[];
}

interface AcceptedJob {
  job_details: {
    job_id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    application_deadline: string;
    ucoin_reward: number;
    max_participants: number;
    status: string;
    job_type: string;
    created_at: string;
    current_participants: number;
  };
  poster_info: {
    name: string;
    username: string;
    email: string;
    user_type: string;
    student_id: string | null;
    mentor_id: string | null;
  };
  your_application: {
    description: string;
    provided_email: string;
    provided_phone_number: string;
    applied_at: string;
    status: string;
  };
}

interface ActiveContractsResponse {
  success: boolean;
  data: {
    posted_jobs: PostedJob[];
    accepted_jobs: AcceptedJob[];
  };
}

function getAvatar(username: string): string {
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

const ActiveContractsPage: React.FC = () => {
  const router = useRouter();
  const [activeContracts, setActiveContracts] = useState<{
    posted_jobs: PostedJob[];
    accepted_jobs: AcceptedJob[];
  }>({ posted_jobs: [], accepted_jobs: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStudentId = localStorage.getItem("student-id");
      if (!storedStudentId) {
        toast.error("Please log in as a student to access this page");
        router.push("/sign-in");
        return;
      }
      setStudentId(storedStudentId);
    }
  }, [router]);

  const fetchActiveContracts = useCallback(async () => {
    if (!studentId) {
      throw new Error("Please log in as a student to access this page");
    }
    setIsLoading(true);
    try {
      const res = await apiRequest({
        endpoint: "api/student/s/jobs/active-contracts",
        method: "GET",
        auth: true,
      });
      if (res.success) {
        setActiveContracts(res.data);
      } else {
        throw new Error(res.message || "Failed to fetch active contracts");
      }
    } catch (err) {
      toast.error("Error fetching active contracts");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchActiveContracts();
    }
  }, [fetchActiveContracts, studentId]);

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-transparent border-b border-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg" />
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-md">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Active Contracts
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  View your posted jobs and accepted applications
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Posted Jobs Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Your Posted Jobs</h2>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-orange-300 rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }} />
                </div>
              </div>
            ) : activeContracts.posted_jobs.length === 0 ? (
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
                  <h3 className="text-xl font-bold text-white mb-2">No posted jobs</h3>
                  <p className="text-slate-400 text-sm">Create a job in the Jobs Hub to get started</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeContracts.posted_jobs.map((job, index) => (
                  <motion.div
                    key={job.job_details.job_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-slate-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-200">
                          {job.job_details.title}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.job_details.status === 'Open' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
                        }`}>
                          {job.job_details.status}
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">{job.job_details.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Start</p>
                              <p className="font-medium text-xs">{formatDate(job.job_details.start_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">End</p>
                              <p className="font-medium text-xs">{formatDate(job.job_details.end_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Deadline</p>
                              <p className="font-medium text-xs">{formatDate(job.job_details.application_deadline)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Reward</p>
                              <p className="font-medium text-xs">{job.job_details.ucoin_reward} uCoins</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Participants</p>
                              <p className="font-medium text-xs">{job.job_details.participant_count}/{job.job_details.max_participants}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Hired</p>
                              <p className="font-medium text-xs">{job.job_details.hired_count}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-700/50 pt-4 mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Hired Applicants</h4>
                        {job.hired_applicants.length === 0 ? (
                          <p className="text-slate-400 text-sm">No applicants hired yet</p>
                        ) : (
                          <div className="space-y-2">
                            {job.hired_applicants.map((applicant) => (
                              <div key={applicant.application_id} className="flex items-center space-x-3">
                                <Image
                                  src={getAvatar(applicant.applicant_info.username)}
                                  alt={`${applicant.applicant_info.username}'s avatar`}
                                  width={32}
                                  height={32}
                                  className="rounded-full border-2 border-orange-500/50 shadow-md"
                                />
                                <div>
                                  <p className="text-sm font-medium text-white">{applicant.applicant_info.name}</p>
                                  <p className="text-xs text-slate-400">@{applicant.applicant_info.username}</p>
                                  <p className="text-xs text-slate-500">{applicant.applicant_info.system_email}</p>
                                  <p className="text-xs text-slate-500">{applicant.applicant_info.provided_email}</p>
                                  <p className="text-xs text-slate-500">{applicant.applicant_info.phone_number}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => router.push(`/s/jobs/${job.job_details.job_id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-blue-500/25"
                      >
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Accepted Jobs Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Jobs You Were Accepted For</h2>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-orange-300 rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }} />
                </div>
              </div>
            ) : activeContracts.accepted_jobs.length === 0 ? (
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
                  <h3 className="text-xl font-bold text-white mb-2">No accepted jobs</h3>
                  <p className="text-slate-400 text-sm">Apply for jobs in the Jobs Hub to get started</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeContracts.accepted_jobs.map((job, index) => (
                  <motion.div
                    key={job.job_details.job_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-slate-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-200">
                          {job.job_details.title}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.job_details.status === 'Open' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
                        }`}>
                          {job.job_details.status}
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">{job.job_details.description}</p>
                      <div className="border-t border-slate-700/50 pt-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={getAvatar(job.poster_info.username)}
                            alt={`${job.poster_info.username}'s avatar`}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-orange-500/50 shadow-md"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{job.poster_info.name}</p>
                            <p className="text-xs text-slate-400">@{job.poster_info.username}</p>
                            <p className="text-xs text-slate-500">{job.poster_info.email}</p>
                            <p className="text-xs text-slate-500">{job.poster_info.user_type}</p>
                            {job.poster_info.student_id && (
                              <p className="text-xs text-slate-500">ID: {job.poster_info.student_id}</p>
                            )}
                            {job.poster_info.mentor_id && (
                              <p className="text-xs text-slate-500">Mentor ID: {job.poster_info.mentor_id}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Start</p>
                              <p className="font-medium text-xs">{formatDate(job.job_details.start_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">End</p>
                              <p className="font-medium text-xs">{formatDate(job.job_details.end_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Deadline</p>
                              <p className="font-medium text-xs">{formatDate(job.job_details.application_deadline)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Reward</p>
                              <p className="font-medium text-xs">{job.job_details.ucoin_reward} uCoins</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-400">Participants</p>
                              <p className="font-medium text-xs">{job.job_details.current_participants}/{job.job_details.max_participants}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-700/50 pt-4 mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Your Application</h4>
                        <p className="text-xs text-slate-300 line-clamp-2">{job.your_application.description}</p>
                        <p className="text-xs text-slate-500">Email: {job.your_application.provided_email}</p>
                        <p className="text-xs text-slate-500">Phone: {job.your_application.provided_phone_number}</p>
                        <p className="text-xs text-slate-500">Applied: {formatDate(job.your_application.applied_at)}</p>
                      </div>
                      <Button
                        onClick={() => router.push(`/s/jobs/${job.job_details.job_id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg h-9 transition-all duration-200 shadow-md hover:shadow-blue-500/25"
                      >
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ActiveContractsPage;