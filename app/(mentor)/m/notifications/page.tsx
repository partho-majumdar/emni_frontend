"use client";

import React from "react";
import Notifications from "@/app/ui/Notifications";
import { motion } from "framer-motion";

export default function MentorNotificationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    >
      <Notifications />
    </motion.div>
  );
}