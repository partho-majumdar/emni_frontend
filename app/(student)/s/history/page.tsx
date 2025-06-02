"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Coins, RefreshCcw, AlertCircle, Download, FileText, TrendingUp, Activity, Loader2, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RefundDialogProps {
  transaction: Transaction;
  onRefundRequested?: () => void;
}

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
  one_on_one_session_id?: string;
  session_start_time?: string;
  session_end_time?: string;
  balance_before?: number;
  balance_after?: number;
  refund_request_id?: string;
}

interface TransactionStats {
  totalTransactions: number;
  totalDepositsBDT: number;
  totalDepositsUCoin: number;
  totalSpentUCoin: number;
  pendingRefundsUCoin: number;
  currentBalanceUCoin: number;
  averageSessionCost: number;
  largestTransaction: number;
  refundedAmount: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    transactions: Transaction[];
    current_balance: number;
    total_purchased: number;
  };
}

const RefundDialog: React.FC<RefundDialogProps> = ({ transaction, onRefundRequested }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRefund = async () => {
    if (!transaction.one_on_one_session_id) {
      toast.error("Invalid session ID");
      return;
    }

    if (reason.length > 1000) {
      toast.error("Reason must be less than 1000 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest({
        endpoint: `api/sessions/refund-request/${transaction.one_on_one_session_id}`,
        method: "POST",
        body: { reason: reason.trim() || null },
      });

      if (response.success) {
        toast.success("Refund request submitted successfully");
        onRefundRequested?.();
      } else {
        throw new Error(response.message || "Failed to submit refund request");
      }
    } catch (err: any) {
      console.error("Refund request failed:", err);
      toast.error(err.message || "Failed to submit refund request");
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
          className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10 flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4 text-orange-400" />
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
            <DialogTitle className="text-xl font-bold text-white">Request Refund</DialogTitle>
            <DialogDescription className="text-gray-400">
              Submit a refund request for {transaction.session_title || "this session"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <motion.div 
              className="grid gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="amount" className="text-gray-300">Amount</Label>
              <Input
                id="amount"
                value={`${transaction.amount_ucoin.toLocaleString()} UCOIN`}
                disabled
                className="bg-gray-800/50 border-gray-600 text-white focus:ring-orange-500/30"
              />
            </motion.div>
            <motion.div 
              className="grid gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="mentor" className="text-gray-300">Mentor</Label>
              <Input
                id="mentor"
                value={transaction.mentor_name || "-"}
                disabled
                className="bg-gray-800/50 border-gray-600 text-white focus:ring-orange-500/30"
              />
            </motion.div>
            <motion.div 
              className="grid gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="reason" className="text-gray-300">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for refund request"
                className="bg-gray-800/50 border-gray-600 text-white focus:ring-orange-500/30"
                maxLength={1000}
              />
            </motion.div>
          </div>
          <DialogFooter>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleSubmitRefund}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Submit Request
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

const StudentTransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalDepositsBDT: 0,
    totalDepositsUCoin: 0,
    totalSpentUCoin: 0,
    pendingRefundsUCoin: 0,
    currentBalanceUCoin: 0,
    averageSessionCost: 0,
    largestTransaction: 0,
    refundedAmount: 0
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const calculateStats = (transactions: Transaction[]) => {
    let depositsBDT = 0;
    let depositsUCoin = 0;
    let spentUCoin = 0;
    let pendingRefunds = 0;
    let refunded = 0;
    let largestAmount = 0;

    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount_ucoin);
      if (amount > largestAmount) {
        largestAmount = amount;
      }

      if (transaction.type === "purchase" && transaction.status === "Completed") {
        if (transaction.amount_currency) {
          depositsBDT += Number(transaction.amount_currency) || 0;
        }
        depositsUCoin += Number(transaction.amount_ucoin) || 0;
      }

      if (transaction.type === "session_payment") {
        if (transaction.status === "Completed") {
          spentUCoin += Math.abs(Number(transaction.amount_ucoin)) || 0;
        }
      }

      if (transaction.status === "Pending") {
        if (transaction.type === "refund_requested" || transaction.type === "session_payment") {
          pendingRefunds += Math.abs(Number(transaction.amount_ucoin)) || 0;
        }
      }

      if (transaction.type === "refund_approved" && transaction.status === "Completed") {
        refunded += Math.abs(Number(transaction.amount_ucoin)) || 0;
      }
    });

    const sessionPayments = transactions.filter(t => 
      t.type === "session_payment" && t.status === "Completed"
    ).length;
    
    const averageSessionCost = sessionPayments > 0 
      ? spentUCoin / sessionPayments 
      : 0;

    const currentBalance = depositsUCoin - spentUCoin + refunded;

    return {
      totalTransactions: transactions.length,
      totalDepositsBDT: parseFloat(depositsBDT.toFixed(2)) || 0.00,
      totalDepositsUCoin: parseFloat(depositsUCoin.toFixed(2)) || 0.00,
      totalSpentUCoin: parseFloat(spentUCoin.toFixed(2)) || 0.00,
      pendingRefundsUCoin: parseFloat(pendingRefunds.toFixed(2)) || 0.00,
      currentBalanceUCoin: parseFloat(currentBalance.toFixed(2)) || 0.00,
      averageSessionCost: parseFloat(averageSessionCost.toFixed(2)) || 0.00,
      largestTransaction: parseFloat(largestAmount.toFixed(2)) || 0.00,
      refundedAmount: parseFloat(refunded.toFixed(2)) || 0.00
    };
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest({
          endpoint: "api/sessions/transactions/history",
          method: "GET",
        });

        if (response.success && response.data) {
          // Sort transactions by date descending (newest first)
            const sortedTransactions: Transaction[] = response.data.transactions.sort(
            (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          setTransactions(sortedTransactions);
          const calculatedStats = calculateStats(sortedTransactions);
          // Use the current balance from API if available
          calculatedStats.currentBalanceUCoin = response.data.current_balance || calculatedStats.currentBalanceUCoin;
          calculatedStats.totalDepositsUCoin = response.data.total_purchased || calculatedStats.totalDepositsUCoin;
          setStats(calculatedStats);
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
      }
    };

    fetchTransactions();
  }, []);

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "purchase":
        return { 
          label: "UCOIN Purchase", 
          icon: <CreditCard className="w-4 h-4" />, 
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30" 
        };
      case "session_payment":
        return { 
          label: "Session Payment", 
          icon: <Coins className="w-4 h-4" />, 
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30" 
        };
      case "refunded_session":
        return { 
          label: "Session Refunded", 
          icon: <RefreshCcw className="w-4 h-4" />, 
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
        };
      case "refund_requested":
        return { 
          label: "Refund Requested", 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30" 
        };
      case "refund_approved":
        return { 
          label: "Refund Approved", 
          icon: <RefreshCcw className="w-4 h-4" />, 
          color: "bg-green-500/20 text-green-400 border-green-500/30" 
        };
      case "refund_rejected":
        return { 
          label: "Refund Rejected", 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-red-500/20 text-red-400 border-red-500/30" 
        };
      case "session_earning":
        return { 
          label: "Session Earning", 
          icon: <Coins className="w-4 h-4" />, 
          color: "bg-green-500/20 text-green-400 border-green-500/30" 
        };
      case "refund_request_received":
        return { 
          label: "Refund Request Received", 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
        };
      default:
        return { 
          label: type, 
          icon: null, 
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30" 
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const utcYear = date.getUTCFullYear();
      const utcMonth = date.getUTCMonth();
      const utcDate = date.getUTCDate();
      const utcHours = date.getUTCHours();
      const utcMinutes = date.getUTCMinutes();
      const localTime = new Date(utcYear, utcMonth, utcDate, utcHours, utcMinutes);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return localTime.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const canRequestRefund = (transaction: Transaction) => {
    if (transaction.type !== "session_payment") return false;
    if (transaction.status !== "Completed") return false;
    if (!transaction.session_start_time) return false;
    if (transaction.action_required === "refund_pending") return false;
    
    try {
      const currentTime = new Date();
      const sessionStartTime = new Date(transaction.session_start_time);
      return currentTime < sessionStartTime;
    } catch (e) {
      return false;
    }
  };

  const handleRefundRequested = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest({
        endpoint: "api/sessions/transactions/history",
        method: "GET",
      });

      if (response.success && response.data) {
        // Sort transactions by date descending (newest first)
        const sortedTransactions: Transaction[] = (response.data.transactions as Transaction[]).sort(
          (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedTransactions);
        const calculatedStats = calculateStats(sortedTransactions);
        setStats(calculatedStats);
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
    }
  };

  const handleDownloadTransactionPDF = async (transaction: Transaction) => {
    try {
      setIsGeneratingPDF(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
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
        ...(transaction.counterpart_name ? [{ label: "Counterpart", value: transaction.counterpart_name }] : []),
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

      if (transaction.type === "session_payment") {
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.roundedRect(15, yPos, pageWidth - 30, 35, 8, 8, 'F');

        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("💸 Session Payment", 25, yPos + 15);
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
      doc.text("Thank you for using UCOIN!", pageWidth / 2, yPos + 20, { align: 'center' });

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

  // Filter and sort transactions
  const filteredTransactions = (selectedTypeFilter === 'all'
    ? transactions
    : transactions.filter(transaction => transaction.type === selectedTypeFilter)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get unique transaction types for filter options
  const transactionTypes = ['all', ...new Set(transactions.map(t => t.type))];

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
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
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
            <p className="text-slate-400 text-sm">Fetching your transaction history...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900/50 flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-xl border border-red-500/20">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400 mb-6 text-sm">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2"
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
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      href="/s/myprofile"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300 text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Activity className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-white-400 font-bold text-white">Transaction History</h1>
                      <p className="text-gray-500 text-sm">Track all your UCOIN transactions here.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-gray-800/50 backdrop-blur-xl hover:border-blue-600/50 transition-all duration-300">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Transaction</p>
                        <p className="text-lg font-bold text-white">{stats.totalTransactions}</p>
                      </div>
                    <div className="p-1.5 bg-blue-500/50 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Total Deposits</p>
                      <p className="text-lg font-bold text-white">BDT {stats.totalDepositsBDT.toLocaleString()}</p>
                    </div>
                    <div className="p-1.5 bg-green-500/20 rounded-lg">
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">UCoins Purchased</p>
                      <p className="text-lg font-bold text-white">{stats.totalDepositsUCoin.toLocaleString()}</p>
                    </div>
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                      <Coins className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Current Balance</p>
                      <p className="text-lg font-bold text-white">{stats.currentBalanceUCoin.toLocaleString()}</p>
                      {/* <p className="text-xs text-gray-400 font-medium">UCoin</p> */}
                    </div>
                    <div className="p-1.5 bg-orange-500/20 rounded-lg">
                      <Wallet className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Total Spent</p>
                      <p className="text-lg font-bold text-white">{stats.totalSpentUCoin.toLocaleString()}</p>
                    </div>
                    <div className="p-1.5 bg-red-500/20 rounded-lg">
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Pending Refunds</p>
                      <p className="text-lg font-bold text-white">{stats.pendingRefundsUCoin.toLocaleString()}</p>
                    </div>
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Avg Session Cost</p>
                      <p className="text-lg font-bold text-white">{stats.averageSessionCost.toLocaleString()}</p>
                    </div>
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Largest Transaction</p>
                      <p className="text-lg font-bold text-white">{stats.largestTransaction}</p>
                    </div>
                    <div className="p-1.5 bg-pink-500/20 rounded-lg">
                      <Activity className="w-4 h-4 text-pink-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    All Transactions
                  </CardTitle>
                </div>
                <Select 
                  value={selectedTypeFilter} 
                  onValueChange={setSelectedTypeFilter}
                >
                  <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-600 text-white focus:ring-gray-600/30">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/50 border-gray-600 text-white">
                    {transactionTypes.map(type => (
                      <SelectItem 
                        key={type} 
                        value={type}
                        className="hover:bg-gray-700/50 focus:bg-gray-200/30"
                      >
                        {type === 'all' ? 'All Types' : formatTransactionType(type).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription className="text-gray-400 text-sm">
                Complete history of your UCOIN transactions and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <Coins className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
                  <p className="text-gray-400">
                    {selectedTypeFilter === 'all' 
                      ? 'Your transaction history will appear here once you start using UCOIN.'
                      : `No transactions of type "${formatTransactionType(selectedTypeFilter).label}" found.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                        <TableRow className="border-gray-700/50 hover:bg-gray-800/30">
                          <TableHead className="text-gray-300 font-semibold py-3 px-2 w-16">S/N</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4">Date & Time</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4">Transaction Type</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4">Amount</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4">Status</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4">Session Details</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4">Counterpart</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4 text-center">Receipt</TableHead>
                          <TableHead className="text-gray-300 font-semibold py-3 px-4 text-center">Action</TableHead>
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
                              <TableCell className="py-6 px-4 text-center">
                                <p className="font-medium text-white">{index + 2}</p>
                              </TableCell>
                              <TableCell className="py-6 px-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-white">{formatDate(transaction.date)}</p>
                                  <p className="text-xs text-gray-400">ID: {transaction.id.substring(0, 8)}...</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-4">
                                <Badge className={`${color} border flex items-center gap-2 hover:scale-105 transition-all duration-200`}>
                                  {icon}
                                  <span className="font-medium">{label}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="py-6 px-4">
                                <div className="space-y-1">
                                  {transaction.type === "purchase" && transaction.amount_currency ? (
                                    <>
                                      <p className="font-bold text-blue-400 text-lg">BDT {transaction.amount_currency.toLocaleString()}</p>
                                      <p className="text-sm text-gray-400">({transaction.amount_ucoin.toLocaleString()} UCOIN)</p>
                                    </>
                                  ) : (
                                    <p className="font-bold text-orange-400 text-lg">{transaction.amount_ucoin.toLocaleString()} UCOIN</p>
                                  )}
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
                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                  } font-medium`}
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-6 px-4">
                                {transaction.session_title ? (
                                  <div className="space-y-1">
                                    <p className="font-medium text-white">{transaction.session_title}</p>
                                    {transaction.reason && (
                                      <p className="text-xs text-gray-400">Reason: {transaction.reason}</p>
                                    )}
                                    {transaction.session_start_time && (
                                      <p className="text-xs text-gray-400">Start: {formatDate(transaction.session_start_time)}</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-400">-</p>
                                )}
                              </TableCell>
                              <TableCell className="py-6 px-4">
                                {transaction.counterpart_name ? (
                                  <p className="font-medium text-white">{transaction.counterpart_name}</p>
                                ) : (
                                  <p className="text-gray-400">-</p>
                                )}
                              </TableCell>
                              <TableCell className="py-6 px-4 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
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
                                {canRequestRefund(transaction) ? (
                                  transaction.action_required === "refund_pending" 
                                    ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-400 border-gray-600/30 cursor-not-allowed flex items-center gap-2"
                                        disabled
                                      >
                                        <RefreshCcw className="w-4 h-4 text-gray-400" />
                                        Refund Pending
                                      </Button>
                                    ) : (
                                      <RefundDialog
                                        transaction={transaction}
                                        onRefundRequested={handleRefundRequested}
                                      />
                                    )
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
)};

export default StudentTransactionHistoryPage;