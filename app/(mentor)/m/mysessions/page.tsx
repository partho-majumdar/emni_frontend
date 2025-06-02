// "use client";
// import { getSessionsMentor } from "@/app/lib/fetchers/sessions";
// import { SessionInfoType } from "@/app/types";
// import SessionCard from "@/app/ui/SessionCard";
// import { jakarta } from "@/app/utils/font";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Card, CardContent } from "@/components/ui/card";
// import { Plus, Calendar, ArrowUpRight, Users, BookOpen } from "lucide-react";
// import { apiRequest } from "@/app/lib/apiClient";

// const MySessions = () => {
//   const [sessions, setSessions] = useState<SessionInfoType[] | null>(null);
//   const [stats, setStats] = useState({
//     totalRevenueUCoin: 0,
//     completedSessions: 0,
//     confirmedStudents: 0,
//     totalSessions: 0
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
        
//         // Fetch both sessions and transaction history in parallel
//         const [sessionsResponse, transactionsResponse] = await Promise.all([
//           getSessionsMentor(),
//           apiRequest({
//             endpoint: "api/sessions/transactions/history",
//             method: "GET",
//           })
//         ]);

//         if (sessionsResponse) {
//           setSessions(sessionsResponse);
//         }

//         if (transactionsResponse.success) {
//           const transactions = transactionsResponse.data;
          
//           // Calculate stats from transaction history
//           let earningsUCoin = 0;
//           let completedSessions = 0;
          
//           interface Transaction {
//             type: string;
//             status: string;
//             amount_ucoin: number | string;
//             // add other fields if needed
//           }

//           (transactions as Transaction[]).forEach((transaction: Transaction) => {
//             if (transaction.type === "session_earning" && transaction.status === "Completed") {
//               earningsUCoin += Number(transaction.amount_ucoin) || 0;
//               completedSessions++;
//             }
//           });

//           setStats({
//             totalRevenueUCoin: parseFloat(earningsUCoin.toFixed(2)) || 0.00,
//             completedSessions,
//             confirmedStudents: completedSessions, // Using same as completed sessions
//             totalSessions: sessionsResponse?.length || 0
//           });
//         } else {
//           throw new Error("Failed to fetch transaction history");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <ScrollArea className="h-screen w-full">
//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
        
//         {/* Floating particles */}
//         <div className="absolute top-20 left-20 w-2 h-2 bg-orange-400/20 rounded-full animate-bounce animation-delay-500"></div>
//         <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/30 rounded-full animate-bounce animation-delay-1500"></div>
//         <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-bounce animation-delay-700"></div>
//         <div className="absolute bottom-20 right-20 w-1 h-1 bg-emerald-400/30 rounded-full animate-bounce animation-delay-2200"></div>
//       </div>

//       <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
//         {/* Header Section */}
//         <div className="flex flex-col space-y-4 mb-6">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/20 animate-pulse">
//                 <BookOpen className="w-6 h-6 text-white" />
//               </div>
//               <h1
//                 className={`${jakarta.className} text-3xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-pulse`}
//               >
//                 My Sessions
//               </h1>
//             </div>
//             <Link href="/m/mysessions/new">
//               <Button className="group bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-101 border border-orange-500/20">
//                 <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
//                 Create Session
//               </Button>
//             </Link>
//           </div>
//           <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent animate-pulse"></div>
//         </div>

//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
//           {/* Total Sessions */}
//           <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-blue-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-blue-500/10">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-gray-400 font-medium mb-1">Total Sessions</p>
//                   <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{stats.totalSessions}</p>
//                 </div>
//                 <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-all duration-300 group-hover:scale-110">
//                   <Calendar className="w-5 h-5 text-blue-400" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Total Revenue */}
//           <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-emerald-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-emerald-500/10">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-gray-400 font-medium mb-1">Total Revenue</p>
//                   <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">{stats.totalRevenueUCoin.toLocaleString()} UCOIN</p>
//                 </div>
//                 <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-all duration-300 group-hover:scale-110">
//                   <ArrowUpRight className="w-5 h-5 text-emerald-400" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Completed Sessions */}
//           <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-purple-500/10">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-gray-400 font-medium mb-1">Completed Sessions</p>
//                   <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{stats.completedSessions}</p>
//                 </div>
//                 <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-all duration-300 group-hover:scale-110">
//                   <BookOpen className="w-5 h-5 text-purple-400" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Confirmed Students */}
//           <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-rose-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-rose-500/10">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-gray-400 font-medium mb-1">Students Booked</p>
//                   <p className="text-2xl font-bold text-white group-hover:text-rose-400 transition-colors duration-300">{stats.confirmedStudents}</p>
//                 </div>
//                 <div className="p-2 bg-rose-500/20 rounded-xl group-hover:bg-rose-500/30 transition-all duration-300 group-hover:scale-110">
//                   <Users className="w-5 h-5 text-rose-400" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sessions List */}
//         <div className="space-y-4">
//           {isLoading ? (
//             <div className="flex items-center justify-center py-16">
//               <div className="relative">
//                 <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full animate-spin"></div>
//                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
//                 <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animation-delay-150"></div>
//               </div>
//             </div>
//           ) : sessions === null || sessions.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-900/30 to-gray-800/30 rounded-2xl border border-gray-700/30 backdrop-blur-xl">
//               <div className="relative mb-6">
//                 <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center animate-pulse">
//                   <BookOpen className="w-10 h-10 text-orange-400/70" />
//                 </div>
//                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500/30 rounded-full animate-ping"></div>
//               </div>
//               <p className="text-gray-300 text-xl font-medium mb-2">No sessions yet</p>
//               <p className="text-gray-500 text-sm mb-6">Create your first session to get started</p>
//               <Link href="/m/mysessions/new">
//                 <Button className="group bg-gradient-to-r from-orange-600/80 to-orange-700/80 hover:from-orange-500 hover:to-orange-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 border border-orange-500/30 hover:shadow-sm hover:shadow-orange-500/25 hover:scale-101">
//                   <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
//                   Create Session
//                 </Button>
//               </Link>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto items-start">
//               {sessions.map((session, index) => (
//                 <div
//                   key={session.sessionId}
//                   className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5"
//                   style={{ animationDelay: `${index * 100}ms` }}
//                 >
//                   <SessionCard
//                     student={false}
//                     sessionDetails={session}
//                     dSession={(sessID: string) => {
//                       const newSessions = sessions.filter((s) => s.sessionId !== sessID);
//                       setSessions(newSessions);
//                       setStats(prev => ({
//                         ...prev,
//                         totalSessions: newSessions.length
//                       }));
//                     }}
//                     updateSessions={(updatedSession: SessionInfoType) => {
//                       const updatedSessions = sessions.map((s) =>
//                         s.sessionId === updatedSession.sessionId ? updatedSession : s
//                       );
//                       setSessions(updatedSessions);
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         .animation-delay-150 { animation-delay: 150ms; }
//         .animation-delay-500 { animation-delay: 500ms; }
//         .animation-delay-700 { animation-delay: 700ms; }
//         .animation-delay-1000 { animation-delay: 1000ms; }
//         .animation-delay-1500 { animation-delay: 1500ms; }
//         .animation-delay-2000 { animation-delay: 2000ms; }
//         .animation-delay-2200 { animation-delay: 2200ms; }
//       `}</style>
//     </ScrollArea>
//   );
// };

// export default MySessions;




"use client";
import { getSessionsMentor } from "@/app/lib/fetchers/sessions";
import { SessionInfoType } from "@/app/types";
import SessionCard from "@/app/ui/SessionCard";
import { jakarta } from "@/app/utils/font";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, ArrowUpRight, Users, BookOpen } from "lucide-react";
import { apiRequest } from "@/app/lib/apiClient";

const MySessions = () => {
  const [sessions, setSessions] = useState<SessionInfoType[] | null>(null);
  const [stats, setStats] = useState({
    totalRevenueUCoin: 0,
    completedSessions: 0,
    confirmedStudents: 0,
    totalSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch both sessions and transaction history in parallel
        const [sessionsResponse, transactionsResponse] = await Promise.all([
          getSessionsMentor(),
          apiRequest({
            endpoint: "api/sessions/transactions/history",
            method: "GET",
          }),
        ]);

        if (sessionsResponse) {
          setSessions(sessionsResponse);
        }

        if (transactionsResponse.success) {
          // Ensure transactions is an array, default to empty array if not
          const transactions = Array.isArray(transactionsResponse.data?.transactions)
            ? transactionsResponse.data.transactions
            : [];

          // Calculate stats from transaction history
          let earningsUCoin = 0;
          let completedSessions = 0;

          interface Transaction {
            type: string;
            status: string;
            amount_ucoin: number | string;
          }

          transactions.forEach((transaction: Transaction) => {
            if (transaction.type === "session_earning" && transaction.status === "Completed") {
              earningsUCoin += Number(transaction.amount_ucoin) || 0;
              completedSessions++;
            }
          });

          setStats({
            totalRevenueUCoin: parseFloat(earningsUCoin.toFixed(2)) || 0.0,
            completedSessions,
            confirmedStudents: completedSessions, // Using same as completed sessions
            totalSessions: sessionsResponse?.length || 0,
          });
        } else {
          throw new Error("Failed to fetch transaction history");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollArea className="h-screen w-full">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
        <div className="absolute top-20 left-20 w-2 h-2 bg-orange-400/20 rounded-full animate-bounce animation-delay-500"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/30 rounded-full animate-bounce animation-delay-1500"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-bounce animation-delay-700"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-emerald-400/30 rounded-full animate-bounce animation-delay-2200"></div>
      </div>

      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/20 animate-pulse">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1
                className={`${jakarta.className} text-3xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-pulse`}
              >
                My Sessions
              </h1>
            </div>
            <Link href="/m/mysessions/new">
              <Button className="group bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-101 border border-orange-500/20">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Session
              </Button>
            </Link>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent animate-pulse"></div>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-blue-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-blue-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{stats.totalSessions}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-all duration-300 group-hover:scale-110">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-emerald-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-emerald-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">{stats.totalRevenueUCoin.toLocaleString()} UCOIN</p>
                </div>
                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Completed Sessions</p>
                  <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{stats.completedSessions}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-all duration-300 group-hover:scale-110">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 hover:border-rose-400/50 transition-all duration-500 hover:scale-101 hover:shadow-xl hover:shadow-rose-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Students Booked</p>
                  <p className="text-2xl font-bold text-white group-hover:text-rose-400 transition-colors duration-300">{stats.confirmedStudents}</p>
                </div>
                <div className="p-2 bg-rose-500/20 rounded-xl group-hover:bg-rose-500/30 transition-all duration-300 group-hover:scale-110">
                  <Users className="w-5 h-5 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animation-delay-150"></div>
              </div>
            </div>
          ) : sessions === null || sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-900/30 to-gray-800/30 rounded-2xl border border-gray-700/30 backdrop-blur-xl">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center animate-pulse">
                  <BookOpen className="w-10 h-10 text-orange-400/70" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500/30 rounded-full animate-ping"></div>
              </div>
              <p className="text-gray-300 text-xl font-medium mb-2">No sessions yet</p>
              <p className="text-gray-500 text-sm mb-6">Create your first session to get started</p>
              <Link href="/m/mysessions/new">
                <Button className="group bg-gradient-to-r from-orange-600/80 to-orange-700/80 hover:from-orange-500 hover:to-orange-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 border border-orange-500/30 hover:shadow-sm hover:shadow-orange-500/25 hover:scale-101">
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Create Session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto items-start">
              {sessions.map((session, index) => (
                <div
                  key={session.sessionId}
                  className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SessionCard
                    student={false}
                    sessionDetails={session}
                    dSession={(sessID: string) => {
                      const newSessions = sessions.filter((s) => s.sessionId !== sessID);
                      setSessions(newSessions);
                      setStats((prev) => ({
                        ...prev,
                        totalSessions: newSessions.length,
                      }));
                    }}
                    updateSessions={(updatedSession: SessionInfoType) => {
                      const updatedSessions = sessions.map((s) =>
                        s.sessionId === updatedSession.sessionId ? updatedSession : s
                      );
                      setSessions(updatedSessions);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-1500 {
          animation-delay: 1500ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .animation-delay-2200 {
          animation-delay: 2200ms;
        }
      `}</style>
    </ScrollArea>
  );
};

export default MySessions;