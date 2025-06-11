"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertCircle, Check } from "lucide-react";
// import { getAvatar } from "./NewsFeed";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 25,
    },
  },
};

interface Notification {
  notification_id: string;
  user_id: string;
  related_user_id: string | null;
  content_type: "post" | "comment" | "reply" | "vote" | "poll_vote" | null;
  content_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface User {
  user_id: string;
  name: string;
  username: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const req: ApiRequestType = {
        endpoint: "auth/me",
        method: "GET",
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        setCurrentUser(res.data);
      } else {
        throw new Error(res.message || "Failed to fetch user");
      }
    } catch (err: any) {
      setError(err.message || "Authentication required");
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const req: ApiRequestType = {
        endpoint: "notifications",
        method: "GET",
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        setNotifications(res.data);
        const userIds = [
          ...new Set(res.data.map((n: Notification) => n.related_user_id).filter(Boolean)),
        ] as string[];
        const userPromises = userIds.map((id) =>
          apiRequest({ endpoint: `users/${id}`, method: "GET", auth: true })
        );
        const userResponses = await Promise.all(userPromises);
        const userMap = userResponses.reduce((acc, res) => {
          if (res.success) acc[res.data.user_id] = res.data;
          return acc;
        }, {} as { [key: string]: User });
        setUsers(userMap);
      } else {
        throw new Error(res.message || "Failed to fetch notifications");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const req: ApiRequestType = {
        endpoint: `notifications/${notificationId}/read`,
        method: "PUT",
        auth: true,
      };
      const res = await apiRequest(req);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n))
        );
        toast.success("Notification marked as read");
      } else {
        throw new Error(res.message || "Failed to mark notification as read");
      }
    } catch (err: any) {
      toast.error(err.message || "Error marking notification as read");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-md"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Authentication Required</h3>
              <p className="text-slate-400 text-sm">Please log in to view notifications.</p>
            </div>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/login"
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium text-center block transition-all duration-200"
          >
            Log In
          </motion.a>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-md"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Error Loading Notifications</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchNotifications}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ScrollArea className="h-screen">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"
            >
              <Bell className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Notifications
            </h1>
          </motion.div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="w-16 h-16 border-4 border-slate-700 border-t-amber-500/80 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-2 border-slate-600 border-b-orange-400/60 rounded-full"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h3 className="text-white font-semibold mb-2">Loading Notifications</h3>
                  <p className="text-slate-400 text-sm">Fetching your notifications...</p>
                </motion.div>
              </motion.div>
            ) : notifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <Bell className="w-10 h-10 text-slate-400" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-3"
                >
                  No Notifications
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400"
                >
                  You're all caught up!
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="notifications"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.notification_id}
                    variants={cardVariants}
                    className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatar(users[notification.related_user_id || ""]?.username || "unknown")}
                        alt={users[notification.related_user_id || ""]?.name || "Unknown"}
                        className="w-8 h-8 rounded-xl border-2 border-slate-600/50"
                      />
                      <div>
                        <p className="text-white text-sm">{notification.message}</p>
                        <p className="text-slate-400 text-xs">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markAsRead(notification.notification_id)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark as Read</span>
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Notifications;