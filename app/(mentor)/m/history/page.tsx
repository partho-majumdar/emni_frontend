// "use client";
// import { GroupSessionInfoType } from "@/app/types";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { Clock, Hourglass } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { jakarta } from "@/app/utils/font";
// import { getGroupSessionListByMentorId } from "@/app/lib/fetchers";
// import { toast } from "sonner";
// import Image from "next/image";
// import { format } from "date-fns";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// const History = () => {
//   const [completedSessions, setCompletedSessions] = useState<GroupSessionInfoType[] | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchCompletedSessions = async () => {
//       const mID = localStorage.getItem("mentor-id");
//       if (!mID) {
//         toast.error("Mentor ID not found. Please sign in.");
//         router.push("/sign-in");
//         return;
//       }
//       try {
//         const data: GroupSessionInfoType[] = await getGroupSessionListByMentorId(mID);
//         const now = new Date();
//         // Filter completed sessions
//         const completed = data
//           .map((session) => ({
//             ...session,
//             startTime: new Date(session.startTime),
//           }))
//           .filter((session) => {
//             const endTime = new Date(session.startTime.getTime() + session.durationInMinutes * 60 * 1000);
//             return now > endTime;
//           });
//         setCompletedSessions(completed);
//       } catch (error) {
//         toast.error("Failed to fetch group session history.");
//         console.error(error);
//       }
//     };
//     fetchCompletedSessions();
//   }, [router]);

//   return (
//     <ScrollArea className="h-screen w-screen w-full">
//       <div className="min-h-screen bg-black p-6">
//         <div className="flex flex-col space-y-4 mb-4">
//           <h1
//             className={`${jakarta.className} text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent`}
//           >
//             Group Session History
//           </h1>
//           <div className="border-b border-gray-800 w-full"></div>
//         </div>
//         <div className="space-y-4">
//           {completedSessions && completedSessions.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-16 w-16 text-gray-600 mb-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={1.5}
//                   d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <p className="text-gray-400 text-lg">No completed group sessions found.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {completedSessions?.map((grpSession) => (
//                 <GroupSessionCard
//                   key={grpSession.id}
//                   GroupSessionDetails={grpSession}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </ScrollArea>
//   );
// };

// // Reused GroupSessionCard component (adapted for History)
// type GroupSessionCardProps = {
//   GroupSessionDetails: GroupSessionInfoType;
// };

// const GroupSessionCard = ({ GroupSessionDetails }: GroupSessionCardProps) => {
//   const minutesToHoursLocal = (minutes: number) => {
//     const hours = Math.floor(minutes / 60);
//     const remainingMinutes = minutes % 60;
//     return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes > 0 ? `${remainingMinutes}m` : ""}`;
//   };

//   const bgColors = [
//     "bg-orange-900",
//     "bg-blue-900",
//     "bg-red-900",
//     "bg-green-900",
//     "bg-purple-900",
//     "bg-teal-900",
//     "bg-indigo-900",
//     "bg-pink-900",
//     "bg-amber-900",
//     "bg-cyan-900",
//     "bg-lime-900",
//     "bg-emerald-900",
//     "bg-fuchsia-900",
//     "bg-rose-900",
//     "bg-violet-900",
//     "bg-yellow-900",
//     "bg-sky-900",
//     "bg-stone-900",
//     "bg-neutral-900",
//     "bg-gray-900",
//     "bg-slate-900",
//     "bg-zinc-900",
//   ];

//   const textColors = [
//     "text-orange-500",
//     "text-blue-500",
//     "text-red-500",
//     "text-green-500",
//     "text-purple-500",
//     "text-teal-500",
//     "text-indigo-500",
//     "text-pink-500",
//     "text-amber-500",
//     "text-cyan-500",
//     "text-lime-500",
//     "text-emerald-500",
//     "text-fuchsia-500",
//     "text-rose-500",
//     "text-violet-500",
//     "text-yellow-500",
//     "text-sky-500",
//     "text-stone-500",
//     "text-neutral-500",
//     "text-gray-500",
//     "text-slate-500",
//     "text-zinc-500",
//   ];

//   const colorIndex = GroupSessionDetails.id.charCodeAt(0) % bgColors.length;
//   const bgColor = bgColors[colorIndex];
//   const textColor = textColors[colorIndex];

//   return (
//     <Card className={`${bgColor} border border-gray-800 rounded-xl shadow-lg transition-transform duration-300 text-white`}>
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <div className="flex items-center font-semibold text-white">
//             {/* <span>{GroupSessionDetails.mentor.name}</span> */}
//           </div>
//           <div className="flex items-center font-bold gap-x-2 text-white">
//             <div className="flex">
//               {GroupSessionDetails.previewParticipants.map((item, i) => (
//                 <Tooltip key={i}>
//                   <TooltipTrigger className="-ml-2">
//                     <span className="w-[40px] h-[40px] overflow-hidden">
//                       <Image
//                         src={item.photoLink}
//                         alt={item.name}
//                         width={40}
//                         height={40}
//                         className="rounded-full border-2 border-gray-700"
//                         unoptimized
//                       />
//                     </span>
//                   </TooltipTrigger>
//                   <TooltipContent>{item.name}</TooltipContent>
//                 </Tooltip>
//               ))}
//             </div>
//             <div>
//               {GroupSessionDetails.participants.current}/{GroupSessionDetails.participants.max}
//             </div>
//           </div>
//         </div>
//         <CardTitle className={`text-2xl font-bold ${textColor}`}>
//           {GroupSessionDetails.title}
//         </CardTitle>
//         <div className="my-2 text-white">
//           <p className="text-sm mb-4">{GroupSessionDetails.description}</p>
//           <span className="flex flex-col gap-y-3 font-semibold">
//             <span className="flex gap-x-2 items-center">
//               <Hourglass size={18} />
//               {minutesToHoursLocal(GroupSessionDetails.durationInMinutes)}
//             </span>
//             <span className="flex gap-x-2 items-center">
//               <Clock size={18} />
//               {format(GroupSessionDetails.startTime, "Pp")}
//             </span>
//             <span className="flex gap-x-2 items-center">
//               <span>Status:</span> Completed
//             </span>
//           </span>
//         </div>
//       </CardHeader>
//     </Card>
//   );
// };

// export default History;




// ----------------------------------- ADD TRANSACTION HISTORY --------------------


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
  totalEarningsUCoin: number;
  totalRefundedUCoin: number;
  pendingRefundsUCoin: number;
  currentBalanceUCoin: number;
  averageSessionEarnings: number;
  largestTransaction: number;
  completedSessions: number;
  cancelledSessions: number;
}

const MentorTransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalEarningsUCoin: 0,
    totalRefundedUCoin: 0,
    pendingRefundsUCoin: 0,
    currentBalanceUCoin: 0,
    averageSessionEarnings: 0,
    largestTransaction: 0,
    completedSessions: 0,
    cancelledSessions: 0
  });

  const calculateStats = (transactions: Transaction[]) => {
    let earningsUCoin = 0;
    let refundedUCoin = 0;
    let pendingRefunds = 0;
    let largestAmount = 0;
    let completedSessions = 0;
    let cancelledSessions = 0;

    transactions.forEach(transaction => {
      // Track largest transaction (absolute value)
      const amount = Math.abs(transaction.amount_ucoin);
      if (amount > largestAmount) {
        largestAmount = amount;
      }

      // Handle session earnings
      if (transaction.type === "session_earning" && transaction.status === "Completed") {
        earningsUCoin += Number(transaction.amount_ucoin) || 0;
        completedSessions++;
      }

      // Handle refunded sessions
      if (transaction.type === "refunded_session") {
        refundedUCoin += Math.abs(Number(transaction.amount_ucoin)) || 0;
        cancelledSessions++;
      }

      // Handle pending refund requests
      if (transaction.status === "Pending") {
        if (transaction.type === "refund_request_received") {
          pendingRefunds += Math.abs(Number(transaction.amount_ucoin)) || 0;
        }
      }
    });

    // Calculate averages and balance
    const averageSessionEarnings = completedSessions > 0 
      ? earningsUCoin / completedSessions 
      : 0;

    const currentBalance = earningsUCoin - refundedUCoin;

    return {
      totalTransactions: transactions.length,
      totalEarningsUCoin: parseFloat(earningsUCoin.toFixed(2)) || 0.00,
      totalRefundedUCoin: parseFloat(refundedUCoin.toFixed(2)) || 0.00,
      pendingRefundsUCoin: parseFloat(pendingRefunds.toFixed(2)) || 0.00,
      currentBalanceUCoin: parseFloat(currentBalance.toFixed(2)) || 0.00,
      averageSessionEarnings: parseFloat(averageSessionEarnings.toFixed(2)) || 0.00,
      largestTransaction: parseFloat(largestAmount.toFixed(2)) || 0.00,
      completedSessions,
      cancelledSessions
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
      case "session_earning":
        return { 
          label: "Session Earnings", 
          icon: <Coins className="w-4 h-4" />, 
          color: "bg-green-500/20 text-green-400 border-green-500/30" 
        };
      case "refunded_session":
        return { 
          label: "Session Refunded", 
          icon: <RefreshCcw className="w-4 h-4" />, 
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
        };
      case "refund_request_received":
        return { 
          label: "Refund Request", 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30" 
        };
      case "refund_approved":
        return { 
          label: "Refund Approved", 
          icon: <RefreshCcw className="w-4 h-4" />, 
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30" 
        };
      case "refund_rejected":
        return { 
          label: "Refund Rejected", 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-red-500/20 text-red-400 border-red-500/30" 
        };
      case "purchase":
        return { 
          label: "UCOIN Purchase", 
          icon: <CreditCard className="w-4 h-4" />, 
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30" 
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
        primary: [59, 130, 246], // Blue
        secondary: [16, 185, 129], // Emerald
        success: [34, 197, 94], // Green
        text: [15, 23, 42], // Slate-900
        textLight: [71, 85, 105], // Slate-600
        background: [248, 250, 252], // Slate-50
        accent: [99, 102, 241], // Indigo
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
        { label: "Amount", value: `${transaction.amount_ucoin.toLocaleString()} UCOIN`},
        ...(transaction.session_title ? [{ label: "Session", value: transaction.session_title}] : []),
        ...(transaction.counterpart_name ? [{ label: "Student", value: transaction.counterpart_name }] : []),
        ...(transaction.reason ? [{ label: "Reason", value: transaction.reason }] : [])
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

      // Amount highlight for mentor earnings
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

      // Footer
      yPos = pageHeight - 50;
      doc.setFillColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.rect(0, yPos, pageWidth, 50, 'F');
      
      // Footer content
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Thank you for mentoring with UCOIN!", pageWidth / 2, yPos + 20, { align: 'center' });
      
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
            <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Transactions</h3>
            <p className="text-gray-400">Fetching your earnings history...</p>
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
            {/* Simple Header */}
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

                {/* Total Earnings */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Earnings</p>
                        <p className="text-xl font-bold text-white">{stats.totalEarningsUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoins earned</p>
                      </div>
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Balance */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Current Balance</p>
                        <p className="text-xl font-bold text-white">{stats.currentBalanceUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">Available UCoins</p>
                      </div>
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Completed Sessions */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Completed Sessions</p>
                        <p className="text-xl font-bold text-white">{stats.completedSessions}</p>
                        <p className="text-xs text-gray-400 mt-1">Successful sessions</p>
                      </div>
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Refunded Amount */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Refunded Amount</p>
                        <p className="text-xl font-bold text-white">{stats.totalRefundedUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoins refunded</p>
                      </div>
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <ArrowDownLeft className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Refunds */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Pending Refunds</p>
                        <p className="text-xl font-bold text-white">{stats.pendingRefundsUCoin.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">UCoin In review</p>
                      </div>
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Session Earnings */}
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Avg Session Earnings</p>
                        <p className="text-xl font-bold text-white">{stats.averageSessionEarnings.toLocaleString()}</p>
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
                        <Coins className="w-5 h-5 text-pink-400" />
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
                  <CircleDollarSign className="w-5 h-5 text-blue-400" />
                  All Transactions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Complete history of your mentoring earnings and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                      <Coins className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                    <p className="text-gray-400">Your transaction history will appear here once you start mentoring sessions.</p>
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
                            <TableHead className="text-gray-300 font-semibold py-4">Student</TableHead>
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
                                    <p className={`font-bold ${
                                      transaction.type === "session_earning" 
                                        ? "text-green-400" 
                                        : transaction.type === "refunded_session" 
                                          ? "text-yellow-400" 
                                          : "text-orange-400"
                                    } text-lg`}>
                                      {transaction.type === "session_earning" ? "+" : "-"}{transaction.amount_ucoin.toLocaleString()} UCOIN
                                    </p>
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