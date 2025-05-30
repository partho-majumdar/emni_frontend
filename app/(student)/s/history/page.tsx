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
import { apiRequest } from "@/app/lib/apiClient";

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

const TransactionHistoryPage = () => {
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

  const calculateStats = (transactions: Transaction[]) => {
    let depositsBDT = 0;
    let depositsUCoin = 0;
    let spentUCoin = 0;
    let pendingRefunds = 0;
    let refunded = 0;
    let largestAmount = 0;

    transactions.forEach(transaction => {
      // Track largest transaction (absolute value)
      const amount = Math.abs(transaction.amount_ucoin);
      if (amount > largestAmount) {
        largestAmount = amount;
      }

      // Handle deposits (purchases)
      if (transaction.type === "purchase" && transaction.status === "Completed") {
        if (transaction.amount_currency) {
          depositsBDT += Number(transaction.amount_currency) || 0;
        }
        depositsUCoin += Number(transaction.amount_ucoin) || 0;
      }

      // Handle session payments
      if (transaction.type === "session_payment") {
        if (transaction.status === "Completed") {
          spentUCoin += Math.abs(Number(transaction.amount_ucoin)) || 0;
        }
      }

      // Handle refund requests (pending)
      if (transaction.status === "Pending") {
        if (transaction.type === "refund_requested" || transaction.type === "session_payment") {
          pendingRefunds += Math.abs(Number(transaction.amount_ucoin)) || 0;
        }
      }

      // Handle approved refunds
      if (transaction.type === "refund_approved" && transaction.status === "Completed") {
        refunded += Math.abs(Number(transaction.amount_ucoin)) || 0;
      }
    });

    // Calculate averages and balance
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

        if (response.success) {
          setTransactions(response.data);
          const calculatedStats = calculateStats(response.data);
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
      default:
        return { 
          label: type, 
          icon: null, 
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30" 
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
    });
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

      // Modern color palette
      const colors = {
        primary: [249, 115, 22], // Orange
        secondary: [59, 130, 246], // Blue
        success: [34, 197, 94], // Green
        text: [15, 23, 42], // Slate-900
        textLight: [71, 85, 105], // Slate-600
        background: [248, 250, 252], // Slate-50
        accent: [251, 146, 60], // Orange-400
        white: [255, 255, 255]
      };

      // Page setup
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Modern header with gradient
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      // Add subtle pattern
      doc.setFillColor(255, 255, 255, 0.1);
      for (let i = 0; i < pageWidth; i += 20) {
        for (let j = 0; j < 60; j += 20) {
          doc.circle(i, j, 1, 'F');
        }
      }

      // Logo area
      doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.roundedRect(15, 10, 40, 40, 8, 8, 'F');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("UC", 35, 30, { align: 'center' });

      // Header text
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("TRANSACTION RECEIPT", pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("UCOIN Digital Payment System", pageWidth / 2, 35, { align: 'center' });
      doc.text(`Receipt #${transaction.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, 45, { align: 'center' });

      yPos = 75;

      // Status banner
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

      // Main content card
      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      doc.roundedRect(15, yPos, pageWidth - 30, 120, 10, 10, 'F');
      
      // Card shadow
      doc.setDrawColor(0, 0, 0, 0.1);
      doc.setLineWidth(0.5);
      doc.roundedRect(16, yPos + 1, pageWidth - 30, 120, 10, 10, 'S');

      yPos += 20;

      // Transaction details
      const details = [
        { label: "Transaction Date", value: formatDate(transaction.date)},
        { label: "Transaction ID", value: transaction.id},
        { label: "Amount", value: transaction.amount_currency 
          ? `BDT ${transaction.amount_currency.toLocaleString()} (${transaction.amount_ucoin.toLocaleString()} UCOIN)`
          : `${transaction.amount_ucoin.toLocaleString()} UCOIN`},
        ...(transaction.payment_method ? [{ label: "Payment Method", value: transaction.payment_method}] : []),
        ...(transaction.session_title ? [{ label: "Session", value: transaction.session_title}] : []),
        ...(transaction.counterpart_name ? [{ label: "Counterpart", value: transaction.counterpart_name }] : [])
      ];

      // Two-column layout
      const leftColumn = details.slice(0, Math.ceil(details.length / 2));
      const rightColumn = details.slice(Math.ceil(details.length / 2));

      // Left column
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

      // Right column
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

      // Amount highlight
      if (transaction.type === "purchase" && transaction.amount_currency) {
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.roundedRect(15, yPos, pageWidth - 30, 35, 8, 8, 'F');
        
        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("💳 Total Amount Paid", 25, yPos + 15);
        doc.setFontSize(20);
        doc.text(`BDT ${transaction.amount_currency.toLocaleString()}`, pageWidth - 25, yPos + 15, { align: 'right' });
        doc.setFontSize(12);
        doc.text(`(${transaction.amount_ucoin.toLocaleString()} UCOIN)`, pageWidth - 25, yPos + 28, { align: 'right' });
        
        yPos += 50;
      }

      // Footer
      yPos = pageHeight - 50;
      doc.setFillColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.rect(0, yPos, pageWidth, 50, 'F');
      
      // Footer content
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Thank you for using UCOIN!", pageWidth / 2, yPos + 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("support@ucoin.com  ||  +880-XXX-XXXX  ||  ucoin.com", pageWidth / 2, yPos + 30, { align: 'center' });
      doc.text(`Generated on ${formatDate(new Date().toISOString())}`, pageWidth / 2, yPos + 40, { align: 'center' });

      // Save PDF
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900/50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Transactions</h3>
            <p className="text-gray-400">Fetching your transaction history...</p>
          </div>
        </div>
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
              className="bg-orange-500 hover:bg-orange-600 text-white"
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
            {/* Simple Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      href="/s/myprofile"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                      <p className="text-gray-400">Track all your UCOIN activities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards - Compact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Total Transactions */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Transactions</p>
                        <p className="text-xl font-bold text-white">{stats.totalTransactions}</p>
                        <p className="text-xs text-gray-400 mt-1">All activities</p>
                      </div>
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Deposits (BDT) */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Deposits</p>
                        <p className="text-xl font-bold text-white">BDT {stats.totalDepositsBDT.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">Cash deposits</p>
                      </div>
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total UCoin Purchased */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">UCoins Purchased</p>
                        <p className="text-xl font-bold text-white">{stats.totalDepositsUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">From deposits</p>
                      </div>
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Coins className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Balance */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Current Balance</p>
                        <p className="text-xl font-bold text-white">{stats.currentBalanceUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">Available UCoins</p>
                      </div>
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Spent */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Spent</p>
                        <p className="text-xl font-bold text-white">{stats.totalSpentUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoins On sessions</p>
                      </div>
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Refunds */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Pending Refunds</p>
                        <p className="text-xl font-bold text-white">{stats.pendingRefundsUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoin In review</p>
                      </div>
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Session Cost */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Avg Session Cost</p>
                        <p className="text-xl font-bold text-white">{stats.averageSessionCost.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoins per session</p>
                      </div>
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Largest Transaction */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Largest Transaction</p>
                        <p className="text-xl font-bold text-white">{stats.largestTransaction.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoins</p>
                      </div>
                      <div className="p-2 bg-pink-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-pink-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Transaction Table */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  All Transactions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Complete history of your UCOIN transactions and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                      <Coins className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                    <p className="text-gray-400">Your transaction history will appear here once you start using UCOIN.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                          <TableRow className="border-gray-700/50 hover:bg-gray-800/30">
                            <TableHead className="text-gray-300 font-semibold py-4">Date & Time</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Transaction Type</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Amount</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Status</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Session Details</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4">Counterpart</TableHead>
                            <TableHead className="text-gray-300 font-semibold py-4 text-center">Receipt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction, index) => {
                            const { label, icon, color } = formatTransactionType(transaction.type);
                            return (
                              <TableRow
                                key={transaction.id}
                                className="border-gray-700/30 hover:bg-gray-800/20 transition-all duration-200 group"
                              >
                                <TableCell className="py-6">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-white">{formatDate(transaction.date)}</p>
                                    <p className="text-xs text-gray-400">ID: {transaction.id.substring(0, 8)}...</p>
                                  </div>
                                </TableCell>
                                
                                <TableCell className="py-6">
                                  <Badge className={`${color} border flex items-center gap-2 hover:scale-105 transition-transform`}>
                                    {icon}
                                    <span className="font-medium">{label}</span>
                                  </Badge>
                                </TableCell>
                                
                                <TableCell className="py-6">
                                  <div className="space-y-1">
                                    {transaction.type === "purchase" && transaction.amount_currency ? (
                                      <>
                                        <p className="font-bold text-white text-lg">BDT {transaction.amount_currency.toLocaleString()}</p>
                                        <p className="text-sm text-gray-400">({transaction.amount_ucoin.toLocaleString()} UCOIN)</p>
                                      </>
                                    ) : (
                                      <p className="font-bold text-orange-400 text-lg">{transaction.amount_ucoin.toLocaleString()} UCOIN</p>
                                    )}
                                  </div>
                                </TableCell>
                                
                                <TableCell className="py-6">
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
                                
                                <TableCell className="py-6">
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
                                
                                <TableCell className="py-6">
                                  {transaction.counterpart_name ? (
                                    <p className="font-medium text-white">{transaction.counterpart_name}</p>
                                  ) : (
                                    <p className="text-gray-400">-</p>
                                  )}
                                </TableCell>
                                
                                <TableCell className="py-6 text-center">
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

export default TransactionHistoryPage;