// "use client";
// import { getSessionsMentor } from "@/app/lib/fetchers/sessions";
// import { SessionInfoType } from "@/app/types";
// import SessionCard from "@/app/ui/SessionCard";
// import { jakarta } from "@/app/utils/font";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import React, { useEffect } from "react";

// const MySessions = () => {
//   const [sessions, setSessions] = React.useState<SessionInfoType[] | null>(
//     null,
//   );
//   useEffect(() => {
//     const fetchSessions = async () => {
//       const data: SessionInfoType[] = await getSessionsMentor();
//       setSessions(data);
//     };
//     fetchSessions();
//   }, []);
//   return (
//     <div className="p-5 flex flex-col">
//       <div className="flex justify-between items-center m-5">
//         <span className={`${jakarta.className} font-black text-4xl`}>
//           My Sessions
//         </span>
//         <Link href="/m/mysessions/new">
//           <Button className="cursor-pointer">Create New Session</Button>
//         </Link>
//       </div>
//       <div className="flex flex-wrap gap-5">
//         {sessions && sessions.length === 0 ? (
//           <p className="text-muted-foreground">No sessions created yet</p>
//         ) : (
//           sessions &&
//           sessions.map((session) => (
//             <SessionCard
//               student={false}
//               key={session.sessionId}
//               sessionDetails={session}
//               dSession={(sessID: string) => {
//                 const newSessions = sessions?.filter(
//                   (session) => session.sessionId !== sessID,
//                 );
//                 setSessions(newSessions);
//               }}
//               updateSessions={(s: SessionInfoType) => {
//                 const updated_sessions = sessions?.map((session) => {
//                   if (session.sessionId === s.sessionId) {
//                     return s;
//                   }
//                   return session;
//                 });
//                 setSessions(updated_sessions);
//               }}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default MySessions;


// ------------------------- above code written by rafi ------------------------



"use client";
import { getSessionsMentor } from "@/app/lib/fetchers/sessions";
import { SessionInfoType } from "@/app/types";
import SessionCard from "@/app/ui/SessionCard";
import { jakarta } from "@/app/utils/font";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MySessions = () => {
  const [sessions, setSessions] = React.useState<SessionInfoType[] | null>(null);
  
  useEffect(() => {
    const fetchSessions = async () => {
      const data: SessionInfoType[] = await getSessionsMentor();
      setSessions(data);
    };
    fetchSessions();
  }, []);

  return (
    <ScrollArea className="h-screen w-full">
      <div className="min-h-screen bg-black p-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className={`${jakarta.className} text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent`}>
              My Sessions
            </h1>
            <Link href="/m/mysessions/new">
              <Button className="bg-orange-800 hover:bg-orange-600 text-white text-1xl font-small transition-all duration-300 shadow-lg hover:shadow-orange-700/50">
                Create New Session
              </Button>
            </Link>
          </div>
          
          <div className="border-b border-gray-800 w-full"></div>
        </div>
        
        <div className="space-y-4">
          {sessions && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 text-lg">No sessions created yet</p>
              <Link href="/m/mysessions/new" className="mt-4">
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
                  Create your first session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto items-start">
              {sessions?.map((session) => (
                <div 
                  key={session.sessionId} 
                  className="hover:scale-[1.01] transition-transform duration-200"
                >
                  <SessionCard
                    student={false}
                    sessionDetails={session}
                    dSession={(sessID: string) => {
                      const newSessions = sessions?.filter(
                        (session) => session.sessionId !== sessID
                      );
                      setSessions(newSessions);
                    }}
                    updateSessions={(s: SessionInfoType) => {
                      const updated_sessions = sessions?.map((session) => {
                        if (session.sessionId === s.sessionId) {
                          return s;
                        }
                        return session;
                      });
                      setSessions(updated_sessions);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default MySessions;