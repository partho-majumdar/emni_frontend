"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Coins, RefreshCcw, AlertCircle, Download, FileText, TrendingUp, Activity, Loader2, Wallet, ArrowUpRight, ArrowDownLeft, CircleDollarSign } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/app/lib/apiClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  type: string;
  amount_currency: number | null;
  amount_ucoin: number;
  payment_method?: string;
  transaction_reference?: string;
  status: string;
  date: string;
  session_title?: string;
  student_name?: string;
  mentor_name?: string;
  reason?: string;
  action_required?: string;
  counterpart_name?: string;
  refund_request_id?: string;
  balance_before?: number;
  balance_after?: number;
  one_on_one_session_id?: string;
  session_start_time?: string;
  session_end_time?: string;
}

interface TransactionStats {
  totalTransactions: number;
  totalEarningsUCoin: number;
  totalRefundedUCoin: number;
  pendingRefundsUCoin: number;
  currentBalanceUCoin: number;
  averageSessionEarnings: number;
  largestTransaction: number;
  completedSessions: number;
  cancelledSessions: number;
}

interface RefundApprovalDialogProps {
  transaction: Transaction;
  currentBalance: number;
  onRefundApproved: (updatedTransaction: Transaction, approvedTransaction: Transaction) => void;
}

const RefundApprovalDialog: React.FC<RefundApprovalDialogProps> = ({ transaction, currentBalance, onRefundApproved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproveRefund = async () => {
    if (!transaction.refund_request_id) {
      toast.error("Invalid refund request ID");
      return;
    }

    // Check if mentor has sufficient balance
    if (currentBalance < transaction.amount_ucoin) {
      toast.error("Cannot refund: Insufficient balance");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest({
        endpoint: `api/sessions/refund-request/approve/${transaction.refund_request_id}`,
        method: "POST",
      });

      if (response.success) {
        toast.success("Refund approved successfully");
        const updatedTransaction: Transaction = {
          ...transaction,
          type: "refund_approved",
          status: "Approved",
          date: new Date().toISOString(),
        };
        const approvedTransaction: Transaction = {
          id: crypto.randomUUID(),
          type: "refunded_session",
          amount_currency: null,
          amount_ucoin: transaction.amount_ucoin,
          status: "Refunded",
          date: new Date().toISOString(),
          session_title: transaction.session_title,
          counterpart_name: transaction.counterpart_name,
          reason: transaction.reason,
        };
        onRefundApproved(updatedTransaction, approvedTransaction);
      } else {
        throw new Error(response.message || "Failed to approve refund");
      }
    } catch (err: any) {
      console.error("Refund approval failed:", err);
      const errorMessage = err.message.includes("Insufficient balance")
        ? "Cannot refund: Insufficient balance"
        : err.message || "Failed to approve refund";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-2 animate-pulse"
        >
          <AlertCircle className="w-4 h-4 text-red-400" />
          {/* Approve Refund */}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Approve Refund Request</DialogTitle>
            <DialogDescription className="text-gray-400">
              Approve the refund request for {transaction.session_title || "this session"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <motion.div 
              className="grid gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm text-gray-300">Amount: <span className="font-medium text-white">{transaction.amount_ucoin.toLocaleString()} UCOIN</span></p>
              <p className="text-sm text-gray-300">Student: <span className="font-medium text-white">{transaction.counterpart_name || "-"}</span></p>
              {transaction.reason && (
                <p className="text-sm text-gray-300">Reason: <span className="font-medium text-white">{transaction.reason}</span></p>
              )}
            </motion.div>
          </div>
          <DialogFooter>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleApproveRefund}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Approve Refund
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

const MentorTransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalEarningsUCoin: 0,
    totalRefundedUCoin: 0,
    pendingRefundsUCoin: 0,
    currentBalanceUCoin: 0,
    averageSessionEarnings: 0,
    largestTransaction: 0,
    completedSessions: 0,
    cancelledSessions: 0,
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const calculateStats = (transactions: Transaction[]) => {
    let earningsUCoin = 0;
    let refundedUCoin = 0;
    let pendingRefunds = 0;
    let largestAmount = 0;
    let completedSessions = 0;
    let cancelledSessions = 0;

    transactions.forEach((transaction) => {
      const amount = Math.abs(Number(transaction.amount_ucoin) || 0);
      if (amount > largestAmount) {
        largestAmount = amount;
      }

      if (transaction.type === "session_earning" && transaction.status === "Completed") {
        earningsUCoin += amount;
        completedSessions++;
      }

      if (transaction.type === "refund_approved" || transaction.type === "refunded_session") {
        refundedUCoin += amount;
        if (transaction.type === "refunded_session") {
          cancelledSessions++;
        }
      }

      if (transaction.status === "Pending" && transaction.type === "refund_request_received") {
        pendingRefunds += amount;
      }
    });

    const averageSessionEarnings = completedSessions > 0 ? earningsUCoin / completedSessions : 0;

    return {
      totalTransactions: transactions.length,
      totalEarningsUCoin: parseFloat(earningsUCoin.toFixed(2)) || 0,
      totalRefundedUCoin: parseFloat(refundedUCoin.toFixed(2)) || 0,
      pendingRefundsUCoin: parseFloat(pendingRefunds.toFixed(2)) || 0,
      currentBalanceUCoin: transactions.length > 0 ? transactions[0].balance_after || 0 : 0,
      averageSessionEarnings: parseFloat(averageSessionEarnings.toFixed(2)) || 0,
      largestTransaction: parseFloat(largestAmount.toFixed(2)) || 0,
      completedSessions,
      cancelledSessions,
    };
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      const response = await apiRequest({
        endpoint: "api/sessions/transactions/history",
        method: "GET",
      });

      if (response.success && response.data.transactions) {
        const sortedTransactions = response.data.transactions.sort(
          (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedTransactions);
        setStats(calculateStats(sortedTransactions));
        setError("");
      } else {
        throw new Error(response.message || "Failed to fetch transaction history");
      }
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transaction history. Please try again.");
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = () => {
    fetchTransactions();
    toast.info("Refreshing transaction history...");
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "session_earning":
        return {
          label: "Session Earnings",
          icon: <Coins className="w-4 h-4" />,
          color: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      case "refunded_session":
        return {
          label: "Session Refunded",
          icon: <RefreshCcw className="w-4 h-4" />,
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      case "refund_request_received":
        return {
          label: "Refund Request",
          icon: <AlertCircle className="w-4 h-4" />,
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };
      case "refund_approved":
        return {
          label: "Refund Approved",
          icon: <RefreshCcw className="w-4 h-4" />,
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
      case "refund_rejected":
        return {
          label: "Refund Rejected",
          icon: <AlertCircle className="w-4 h-4" />,
          color: "bg-red-500/20 text-red-400 border-red-500/30",
        };
      case "purchase":
        return {
          label: "UCOIN Purchase",
          icon: <CreditCard className="w-4 h-4" />,
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        };
      default:
        return {
          label: type,
          icon: null,
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth();
    const utcDate = date.getUTCDate();
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const localTime = new Date(utcYear, utcMonth, utcDate, utcHours, utcMinutes);
    return localTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }); // e.g., "Jun 2, 2025"
  };

  const handleDownloadTransactionPDF = async (transaction: Transaction) => {
    try {
      setIsGeneratingPDF(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const colors = {
        primary: [59, 130, 246],
        secondary: [16, 185, 129],
        success: [34, 197, 94],
        text: [15, 23, 42],
        textLight: [71, 85, 105],
        background: [248, 250, 252],
        accent: [99, 102, 241],
        white: [255, 255, 255],
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(0, 0, pageWidth, 60, 'F');

      doc.setFillColor(255, 255, 255, 0.1);
      for (let i = 0; i < pageWidth; i += 20) {
        for (let j = 0; j < 60; j += 20) {
          doc.circle(i, j, 1, 'F');
        }
      }

      doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.roundedRect(15, 10, 40, 40, 8, 8, 'F');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("UC", 35, 30, { align: 'center' });

      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("TRANSACTION RECEIPT", pageWidth / 2, 25, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("UCOIN Digital Payment System", pageWidth / 2, 35, { align: 'center' });
      doc.text(`Receipt #${transaction.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, 45, { align: 'center' });

      yPos = 75;

      const { label } = formatTransactionType(transaction.type);
      const statusColor = transaction.status === "Completed" ? colors.success :
                         transaction.status === "Pending" ? colors.accent : colors.primary;

      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(15, yPos, pageWidth - 30, 20, 5, 5, 'F');
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${label.toUpperCase()} - ${transaction.status.toUpperCase()}`, pageWidth / 2, yPos + 13, { align: 'center' });

      yPos += 35;

      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      doc.roundedRect(15, yPos, pageWidth - 30, 120, 10, 10, 'F');

      doc.setDrawColor(0, 0, 0, 0.1);
      doc.setLineWidth(0.5);
      doc.roundedRect(16, yPos + 1, pageWidth - 32, 120, 10, 10, 'S');

      yPos += 20;

      const details = [
        { label: "Transaction Date", value: formatDate(transaction.date) },
        { label: "Transaction ID", value: transaction.id },
        { label: "Amount", value: `${transaction.amount_ucoin.toLocaleString()} UCOIN` },
        ...(transaction.session_title ? [{ label: "Session", value: transaction.session_title }] : []),
        ...(transaction.counterpart_name ? [{ label: "Student", value: transaction.counterpart_name }] : []),
        ...(transaction.reason ? [{ label: "Reason", value: transaction.reason }] : []),
      ];

      const leftColumn = details.slice(0, Math.ceil(details.length / 2));
      const rightColumn = details.slice(Math.ceil(details.length / 2));

      let leftYPos = yPos;
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      leftColumn.forEach((detail) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
        doc.text(`${detail.label}`, 25, leftYPos);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const wrappedText = doc.splitTextToSize(detail.value, 70);
        doc.text(wrappedText, 25, leftYPos + 8);
        leftYPos += 20;
      });

      let rightYPos = yPos;
      rightColumn.forEach((detail) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
        doc.text(`${detail.label}`, 115, rightYPos);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const wrappedText = doc.splitTextToSize(detail.value, 70);
        doc.text(wrappedText, 115, rightYPos + 8);
        rightYPos += 20;
      });

      yPos += 140;

      if (transaction.type === "session_earning") {
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.roundedRect(15, yPos, pageWidth - 30, 35, 8, 8, 'F');

        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("💰 Earnings From Session", 25, yPos + 15);
        doc.setFontSize(20);
        doc.text(`${transaction.amount_ucoin.toLocaleString()} UCOIN`, pageWidth - 25, yPos + 15, { align: 'right' });

        yPos += 50;
      }

      yPos = pageHeight - 50;
      doc.setFillColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.rect(0, yPos, pageWidth, 50, 'F');

      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Thank you for mentoring with UCOIN!", pageWidth / 2, yPos + 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("support@ucoin.com  ||  +880-XXX-XXXX  ||  ucoin.com", pageWidth / 2, yPos + 30, { align: 'center' });
      doc.text(`Generated on ${formatDate(new Date().toISOString())}`, pageWidth / 2, yPos + 40, { align: 'center' });

      const fileName = `UCOIN_Receipt_${transaction.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success("🎉 PDF receipt downloaded successfully!");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("❌ Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRefundApproved = (updatedTransaction: Transaction, approvedTransaction: Transaction) => {
    setTransactions((prev) => {
      const updatedTransactions = prev.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      ).concat([approvedTransaction]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setStats(calculateStats(updatedTransactions));
      return updatedTransactions;
    });
  };

  const filteredTransactions = selectedTypeFilter === 'all'
    ? transactions
    : transactions.filter((transaction) => transaction.type === selectedTypeFilter);

  const transactionTypes = ['all', ...new Set(transactions.map((t) => t.type))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
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
            <h3 className="text-white font-semibold mb-2">Loading Transactions</h3>
            <p className="text-slate-400 text-sm">Fetching your earnings history...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900/50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-xl border border-red-500/20">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900/50">
      <div className="relative z-10">
        <ScrollArea className="h-screen">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href="/m/myprofile"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <CircleDollarSign className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Earnings & Transactions</h1>
                      <p className="text-gray-400">Track all your mentoring earnings and activities</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Transactions</p>
                        <p className="text-xl font-bold text-white">{stats.totalTransactions}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">All activities</p> */}
                      </div>
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Earnings</p>
                        <p className="text-xl font-bold text-white">{stats.totalEarningsUCoin.toLocaleString()}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">UCoins earned</p> */}
                      </div>
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Current Balance</p>
                        <p className="text-xl font-bold text-white">{stats.currentBalanceUCoin.toLocaleString()}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">Available UCoins</p> */}
                      </div>
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Completed Sessions</p>
                        <p className="text-xl font-bold text-white">{stats.completedSessions}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">Successful sessions</p> */}
                      </div>
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Refunded Amount</p>
                        <p className="text-xl font-bold text-white">{stats.totalRefundedUCoin.toLocaleString()}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">UCoins refunded</p> */}
                      </div>
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <ArrowDownLeft className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Pending Refunds</p>
                        <p className="text-xl font-bold text-white">{stats.pendingRefundsUCoin.toLocaleString()}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">UCoins in review</p> */}
                      </div>
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Avg Session Earnings</p>
                        <p className="text-xl font-bold text-white">{stats.averageSessionEarnings.toLocaleString()}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">UCoins per session</p> */}
                      </div>
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Largest Transaction</p>
                        <p className="text-xl font-bold text-white">{stats.largestTransaction.toLocaleString()}</p>
                        {/* <p className="text-xs text-gray-400 mt-1">UCoins</p> */}
                      </div>
                      <div className="p-2 bg-pink-500/20 rounded-lg">
                        <Coins className="w-5 h-5 text-pink-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-blue-400" />
                    All Transactions
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="w-4 h-4" />
                      )}
                    </Button>
                    <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                      <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/50 border-gray-600 text-white">
                        {transactionTypes.map((type) => (
                          <SelectItem key={type} value={type} className="hover:bg-gray-700/50">
                            {type === 'all' ? 'All Types' : formatTransactionType(type).label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription className="text-gray-400">
                  Complete history of your mentoring earnings and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                      <Coins className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {selectedTypeFilter === 'all' ? 'No transactions yet' : `No ${formatTransactionType(selectedTypeFilter).label} transactions`}
                    </h3>
                    <p className="text-gray-400">
                      {selectedTypeFilter === 'all'
                        ? 'Your transaction history will appear here once you start mentoring sessions.'
                        : `No transactions of type "${formatTransactionType(selectedTypeFilter).label}" found.`}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <ScrollArea className="h-[600px] table-container">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-900/95 z-10">
                          <TableRow className="border-gray-700/50 hover:bg-gray-800/30">
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap">S/N</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap">Date</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap">Transaction Type</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap">Amount</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap">Status</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap hidden md:table-cell">Session Details</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 whitespace-nowrap hidden md:table-cell">Student</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 text-center whitespace-nowrap">Receipt</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 px-4 text-center whitespace-nowrap">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((transaction, index) => {
                            const { label, icon, color } = formatTransactionType(transaction.type);
                            return (
                              <TableRow
                                key={transaction.id}
                                className="border-gray-700/30 hover:bg-gray-800/20 transition-all duration-200"
                              >
                                <TableCell className="py-6 px-4">
                                  <p className="font-semibold text-white">{index + 1}</p>
                                </TableCell>
                                <TableCell className="py-6 px-4">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-white">{formatDate(transaction.date)}</p>
                                    <p className="text-xs text-gray-400">ID: {transaction.id.substring(0, 8)}...</p>
                                  </div>
                                </TableCell>
                                <TableCell className="py-6 px-4">
                                  <Badge className={`${color} border flex items-center gap-2 hover:scale-105 transition-transform`}>
                                    {icon}
                                    <span className="font-medium">{label}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-6 px-4">
                                  <div className="space-y-1">
                                    <p className={`font-bold ${
                                      transaction.type === "session_earning"
                                        ? "text-green-400"
                                        : transaction.type === "refunded_session"
                                        ? "text-yellow-400"
                                        : "text-orange-400"
                                    } text-lg font-semibold`}>
                                      {transaction.type === "session_earning" ? "+" : "-"}{transaction.amount_ucoin.toLocaleString()} UCOIN
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="py-6 px-4">
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      transaction.status === "Completed"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : transaction.status === "Pending"
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                                    } font-medium`}
                                  >
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-6 px-4 hidden md:table-cell">
                                  {transaction.session_title ? (
                                    <div className="space-y-1">
                                      <p className="font-medium text-white">{transaction.session_title}</p>
                                      {transaction.reason && (
                                        <p className="text-xs text-gray-400">Reason: {transaction.reason}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-400">-</p>
                                  )}
                                </TableCell>
                                <TableCell className="py-6 px-4 hidden md:table-cell">
                                  {transaction.counterpart_name ? (
                                    <p className="font-medium text-white">{transaction.counterpart_name}</p>
                                  ) : (
                                    <p className="text-gray-400">-</p>
                                  )}
                                </TableCell>
                                <TableCell className="py-6 px-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => handleDownloadTransactionPDF(transaction)}
                                    disabled={isGeneratingPDF}
                                  >
                                    {isGeneratingPDF ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="py-6 px-4 text-center">
                                  {transaction.type === "refund_request_received" && transaction.status === "Pending" ? (
                                    <RefundApprovalDialog
                                      transaction={transaction}
                                      currentBalance={stats.currentBalanceUCoin} // Pass current balance
                                      onRefundApproved={handleRefundApproved}
                                    />
                                  ) : (
                                    <p className="text-gray-400">-</p>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MentorTransactionHistoryPage;