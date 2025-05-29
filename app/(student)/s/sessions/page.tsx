import { getSessionsForStudentBasedOnInterest, getSessionsForStudentOuterInterests } from "@/app/lib/fetchers/sessions";
import { SessionInfoType } from "@/app/types";
import { gradientText1 } from "@/app/ui/CustomStyles";
import SessionCard from "@/app/ui/SessionCard";
import { jakarta } from "@/app/utils/font";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";

const SessionsPage = async () => {
  try {
    const sessionsBasedOnInterests: SessionInfoType[] = await getSessionsForStudentBasedOnInterest();
    const sessionsOutsideInterests: SessionInfoType[] = await getSessionsForStudentOuterInterests();

    return (
      <div className="min-h-screen w-full relative overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-500/20 to-orange-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-orange-600/10 to-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-orange-400/15 to-orange-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-transparent to-gray-900/90"></div>
        </div>

        <ScrollArea className="h-screen w-full relative">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full opacity-60"></div>
              
              <div className="inline-block mb-4">
                <h1
                  className={cn(
                    "font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-4 relative",
                    jakarta.className
                  )}
                >
                  <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                    1:1 Sessions
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-400/20 blur-xl rounded-2xl opacity-60"></div>
                </h1>
                
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Unlock your potential with personalized mentorship
                  </p>
                  <p className="text-sm text-gray-400 max-w-xl mx-auto">
                    Connect with expert mentors tailored to your learning goals
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 font-medium text-sm">
                    {(sessionsBasedOnInterests?.length || 0) + (sessionsOutsideInterests?.length || 0)} Available Sessions
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full animate-pulse delay-500"></div>
                  <span className="text-gray-300 font-medium text-sm">Expert Mentors</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full animate-pulse delay-1000"></div>
                  <span className="text-gray-300 font-medium text-sm">Instant Booking</span>
                </div>
              </div>
            </div>

            {sessionsBasedOnInterests && sessionsBasedOnInterests.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                  <span className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded-full border border-gray-700/50">
                    Curated for your interests
                  </span>
                </div>
                
                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/30 hover:border-orange-500/20 p-6 shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-400/5 rounded-2xl"></div>
                  
                  <ScrollArea className="h-screen w-full relative">
                    <div className="grid grid-cols-3 gap-4 pb-4">
                      {sessionsBasedOnInterests.map((s, i: number) => (
                        <SessionCard key={i} sessionDetails={s} student={true} />
                      ))}
                    </div>
                    
                    <ScrollBar
                      orientation="vertical"
                      className="bg-gray-700/30 hover:bg-orange-500/50 rounded-full w-2 transition-all duration-300"
                    />
                  </ScrollArea>
                </div>
              </div>
            )}

            {sessionsOutsideInterests && sessionsOutsideInterests.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-600 to-amber-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Explore New Areas</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                  <span className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded-full border border-gray-700/50">
                    Expand your horizons
                  </span>
                </div>
                
                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/30 hover:border-orange-500/20 p-6 shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 via-transparent to-amber-500/5 rounded-2xl"></div>
                  
                  <ScrollArea className="h-screen w-full relative">
                    <div className="grid grid-cols-3 gap-4 pb-4">
                      {sessionsOutsideInterests.map((s, i: number) => (
                        <SessionCard key={i} sessionDetails={s} student={true} />
                      ))}
                    </div>
                    
                    <ScrollBar
                      orientation="vertical"
                      className="bg-gray-700/30 hover:bg-orange-500/50 rounded-full w-2 transition-all duration-300"
                    />
                  </ScrollArea>
                </div>
              </div>
            )}

            {(!sessionsBasedOnInterests || sessionsBasedOnInterests.length === 0) && 
             (!sessionsOutsideInterests || sessionsOutsideInterests.length === 0) && (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-800/60 to-gray-700/50 rounded-full flex items-center justify-center mb-4 mx-auto border border-gray-700/50">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-orange-400/15 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-3">No Sessions Available</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
                  It looks like there are no mentorship sessions available at the moment. Check back later or contact support.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full font-semibold hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-orange-500/30">
                  Explore Other Options
                </button>
              </div>
            )}

            {((sessionsBasedOnInterests && sessionsBasedOnInterests.length > 0) || 
              (sessionsOutsideInterests && sessionsOutsideInterests.length > 0)) && (
              <div className="text-center mt-12 pb-8">
                <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1 max-w-24"></div>
                  <span className="flex items-center gap-2 text-xs bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700/50">
                    <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Find your perfect mentor match
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1 max-w-24"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        </ScrollArea>
      </div>
    );
  } catch (error) {
    console.error("Error loading sessions:", error);
    
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-orange-500/30">
            <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-300 mb-3">Something went wrong</h2>
          <p className="text-gray-400 mb-4 text-sm">Unable to load sessions. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-600 transition-all duration-300 text-sm border border-orange-500/30"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
};

export default SessionsPage;































// ----------------------------- PURPLE COLOR -----------------------------------


// import { getSessionsForStudentBasedOnInterest, getSessionsForStudentOuterInterests } from "@/app/lib/fetchers/sessions";
// import { SessionInfoType } from "@/app/types";
// import { gradientText1 } from "@/app/ui/CustomStyles";
// import SessionCard from "@/app/ui/SessionCard";
// import { jakarta } from "@/app/utils/font";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import React from "react";

// const SessionsPage = async () => {
//   try {
//     const sessionsBasedOnInterests: SessionInfoType[] = await getSessionsForStudentBasedOnInterest();
//     const sessionsOutsideInterests: SessionInfoType[] = await getSessionsForStudentOuterInterests();

//     return (
//       <div className="min-h-screen w-full relative overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
//           <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
//           {/* Grid pattern */}
//           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
//           {/* Gradient overlay */}
//           <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-transparent to-slate-900/90"></div>
//         </div>

//         {/* Main Content */}
//         <ScrollArea className="h-screen w-full relative">
//         <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
//           <div className="max-w-7xl mx-auto">
//             {/* Header Section */}
//             <div className="text-center mb-12 relative">
//               {/* Decorative line */}
//               <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full opacity-60"></div>
              
//               <div className="inline-block mb-4">
//                 <h1
//                   className={cn(
//                     "font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-4 relative",
//                     jakarta.className
//                   )}
//                 >
//                   <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
//                     1:1 Sessions
//                   </span>
//                   <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-xl rounded-2xl opacity-60"></div>
//                 </h1>
                
//                 {/* Subtitle */}
//                 <div className="space-y-1">
//                   <p className="text-lg sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
//                     Unlock your potential with personalized mentorship
//                   </p>
//                   <p className="text-sm text-slate-400 max-w-xl mx-auto">
//                     Connect with expert mentors tailored to your learning goals
//                   </p>
//                 </div>
//               </div>

//               {/* Stats Bar */}
//               <div className="flex flex-wrap items-center justify-center gap-4 mt-8 mb-6">
//                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
//                   <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
//                   <span className="text-slate-300 font-medium text-sm">
//                     {(sessionsBasedOnInterests?.length || 0) + (sessionsOutsideInterests?.length || 0)} Available Sessions
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
//                   <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse delay-500"></div>
//                   <span className="text-slate-300 font-medium text-sm">Expert Mentors</span>
//                 </div>
//                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
//                   <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse delay-1000"></div>
//                   <span className="text-slate-300 font-medium text-sm">Instant Booking</span>
//                 </div>
//               </div>
//             </div>

//             {sessionsBasedOnInterests && sessionsBasedOnInterests.length > 0 && (
//               <div className="mb-12">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
//                   <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
//                   <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent"></div>
//                 </div>
                
//                 <div className="relative bg-slate-800/20 backdrop-blur-xl rounded-2xl border border-slate-700/30 p-6 shadow-xl">
//                   <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
                  
//                   <ScrollArea className="h-screen w-full relative">
//                     <div className="grid grid-cols-3 gap-4 pb-4">
//                       {sessionsBasedOnInterests.map((s, i: number) => (
//                         <SessionCard key={i} sessionDetails={s} student={true} />
//                       ))}
//                     </div>
                    
//                     <ScrollBar
//                       orientation="vertical"
//                       className="bg-slate-700/30 hover:bg-purple-500/50 rounded-full w-2 transition-all duration-300"
//                     />
//                   </ScrollArea>
//                 </div>
//               </div>
//             )}

//             {sessionsOutsideInterests && sessionsOutsideInterests.length > 0 && (
//               <div className="mb-12">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
//                   <h2 className="text-2xl font-bold text-white">Explore New Areas</h2>
//                   <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent"></div>
//                 </div>
                
//                 <div className="relative bg-slate-800/20 backdrop-blur-xl rounded-2xl border border-slate-700/30 p-6 shadow-xl">
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl"></div>
                  
//                   <ScrollArea className="h-screen w-full relative">
//                     <div className="grid grid-cols-3 gap-4 pb-4">
//                       {sessionsOutsideInterests.map((s, i: number) => (
//                         <SessionCard key={i} sessionDetails={s} student={true} />
//                       ))}
//                     </div>
                    
//                     <ScrollBar
//                       orientation="vertical"
//                       className="bg-slate-700/30 hover:bg-blue-500/50 rounded-full w-2 transition-all duration-300"
//                     />
//                   </ScrollArea>
//                 </div>
//               </div>
//             )}

//             {/* Empty State - Only show if both sections are empty */}
//             {(!sessionsBasedOnInterests || sessionsBasedOnInterests.length === 0) && 
//              (!sessionsOutsideInterests || sessionsOutsideInterests.length === 0) && (
//               <div className="text-center py-16">
//                 <div className="relative inline-block mb-6">
//                   <div className="w-24 h-24 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-full flex items-center justify-center mb-4 mx-auto">
//                     <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
//                       <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//                 <h3 className="text-xl font-bold text-slate-300 mb-3">No Sessions Available</h3>
//                 <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
//                   It looks like there are no mentorship sessions available at the moment. Check back later or contact support.
//                 </p>
//                 <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
//                   Explore Other Options
//                 </button>
//               </div>
//             )}

//             {/* Bottom Section */}
//             {((sessionsBasedOnInterests && sessionsBasedOnInterests.length > 0) || 
//               (sessionsOutsideInterests && sessionsOutsideInterests.length > 0)) && (
//               <div className="text-center mt-12 pb-8">
//                 <div className="flex items-center justify-center gap-4 text-slate-500 text-sm">
//                   <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-24"></div>
//                   <span className="flex items-center gap-2 text-xs">
//                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                     </svg>
//                     Find your perfect mentor match
//                   </span>
//                   <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-24"></div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//         </ScrollArea>
//       </div>
//     );
//   } catch (error) {
//     console.error("Error loading sessions:", error);
    
//     return (
//       <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
//         <div className="text-center">
//           <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
//             <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//           </div>
//           <h2 className="text-xl font-bold text-slate-300 mb-3">Something went wrong</h2>
//           <p className="text-slate-400 mb-4 text-sm">Unable to load sessions. Please try again later.</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }
// };

// export default SessionsPage;