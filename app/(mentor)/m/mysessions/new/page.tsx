// "use client";
// import { Checkbox } from "@/components/ui/checkbox";
// import { SessionInfoType, SessionType } from "@/app/types";
// import EditableField from "@/app/ui/EditableField";
// import {
//   Select,
//   SelectContent,
//   SelectTrigger,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import React, { useState } from "react";
// import { smooth_hover, theme_style } from "@/app/ui/CustomStyles";
// import { createSession } from "@/app/lib/mutations/mentor";
// import { useRouter } from "next/navigation";

// const topics = [
//   "Course Topic Tution",
//   "Project Help",
//   "Career Guidance",
//   "Competition Prep",
//   "Productivity",
//   "ECA",
//   "Resume Review",
//   "Research Guidance",
//   "Mock Interview",
// ];

// const CreateNewSession = () => {
//   const [sessionDetails, setSessionDetails] = useState<SessionInfoType>({
//     type: "Course Topic Tution",
//     title: "",
//     DurationInMinutes: 0,
//     session_medium: ["online"],
//     Description: "",
//     Price: 0,
//   });
//   const r = useRouter();
//   const [err, setErr] = useState<string | null>(null);
//   const handleCreateSession = async () => {
//     const res = await createSession(sessionDetails);
//     if (res.err) {
//       setErr(res.err);
//     }
//     r.push("/m/mysessions");
//   };
//   return (
//     <div className="p-5 mt-20 mr-20">
//       <div className="text-3xl font-semibold">Create A New Session</div>
//       <div>
//         <EditableField
//           value={sessionDetails.title}
//           onChange={(value) =>
//             setSessionDetails({ ...sessionDetails, title: value })
//           }
//           placeholder="Session Title"
//           className="mt-5 text-3xl py-2 border rounded-lg w-1/2 px-3"
//         />
//         <div className="flex gap-x-4 my-5">
//           <Select
//             onValueChange={(val) =>
//               setSessionDetails({
//                 ...sessionDetails,
//                 type: val as SessionType,
//               })
//             }
//           >
//             <SelectTrigger className="w-[400px]">
//               <SelectValue placeholder="Session Type" />
//             </SelectTrigger>
//             <SelectContent>
//               {topics.map((t) => {
//                 return (
//                   <SelectItem key={t} value={t}>
//                     {t}
//                   </SelectItem>
//                 );
//               })}
//             </SelectContent>
//           </Select>

//           <Select
//             onValueChange={(val) => {
//               const duration = parseInt(val);
//               setSessionDetails({
//                 ...sessionDetails,
//                 DurationInMinutes: duration,
//               });
//             }}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select Duration" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="30">30 minutes</SelectItem>
//               <SelectItem value="60">1 hour</SelectItem>
//               <SelectItem value="90">1.5 hours</SelectItem>
//               <SelectItem value="120">2 hours</SelectItem>
//               <SelectItem value="150">2.5 hours</SelectItem>
//               <SelectItem value="180">3 hours</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex gap-x-4 text-xl items-center">
//           <span className="flex h-full items-center">
//             <Checkbox
//               className="w-5 h-5"
//               onCheckedChange={(b) => {
//                 if (b && !sessionDetails.session_medium.includes("online")) {
//                   setSessionDetails({
//                     ...sessionDetails,
//                     session_medium: [
//                       ...sessionDetails.session_medium,
//                       "online",
//                     ],
//                   });
//                 }
//               }}
//             />
//             <span className="ml-2">Online</span>
//           </span>

//           <span className="flex h-full items-center">
//             <Checkbox
//               className="w-5 h-5"
//               onCheckedChange={(b) => {
//                 if (b && !sessionDetails.session_medium.includes("offline")) {
//                   setSessionDetails({
//                     ...sessionDetails,
//                     session_medium: [
//                       ...sessionDetails.session_medium,
//                       "offline",
//                     ],
//                   });
//                 }
//               }}
//             />
//             <span className="ml-2">Offline</span>
//           </span>
//         </div>
//         <div>
//           <textarea
//             onChange={(e) =>
//               setSessionDetails({
//                 ...sessionDetails,
//                 Description: e.target.value,
//               })
//             }
//             placeholder="Description"
//             className="my-10 text-xl w-1/2 h-[200px] p-5 border rounded-lg border focus:outline-none"
//           />
//         </div>
//         <div className="flex flex-col">
//           Put a price for the session
//           <span className="opacity-50">Price must be under 500 UCOIN</span>
//           <EditableField
//             value={sessionDetails.Price.toString()}
//             onChange={(value) => {
//               const val = parseInt(value);

//               if (value === "") {
//                 setSessionDetails({
//                   ...sessionDetails,
//                   Price: 0, // or empty string if you want
//                 });
//                 return;
//               }

//               if (!isNaN(val)) {
//                 if (val >= 1 && val <= 500) {
//                   setSessionDetails({
//                     ...sessionDetails,
//                     Price: val,
//                   });
//                 }
//               }
//             }}
//             placeholder="Price"
//             className="mt-2 text-3xl py-2 border rounded-lg w-[300px] px-3"
//           />
//         </div>
//         <div className={"my-5"}>
//           <span
//             className={`${theme_style} rounded-lg p-2 my-5 cursor-pointer hover:opacity-70 ${smooth_hover} text-lg`}
//             onClick={handleCreateSession}
//           >
//             Create Session
//           </span>
//           <span>{err}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateNewSession;


// --------------------------- above code written by rafi -------------------------


"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { SessionInfoType, SessionType, meeting_medium } from "@/app/types";
import EditableField from "@/app/ui/EditableField";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from "react";
import { createSession } from "@/app/lib/mutations/mentor";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const topics = [
  "Course Topic Tuition",
  "Project Help",
  "Career Guidance",
  "Competition Prep",
  "Productivity",
  "ECA",
  "Resume Review",
  "Research Guidance",
  "Mock Interview",
];

const CreateNewSession = () => {
  const [sessionDetails, setSessionDetails] = useState<SessionInfoType>({
    type: "Course Topic Tuition",
    title: "",
    DurationInMinutes: 0,
    session_medium: ["online"] as meeting_medium[],
    Description: "",
    Price: 0,
  });
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  const validateFields = () => {
    if (!sessionDetails.title.trim()) {
      toast.warning("Session title is required");
      return false;
    }
    if (!sessionDetails.type) {
      toast.warning("Session type is required");
      return false;
    }
    if (sessionDetails.DurationInMinutes === 0) {
      toast.warning("Session duration is required");
      return false;
    }
    if (sessionDetails.session_medium.length === 0) {
      toast.warning("At least one session medium (Online or Offline) is required");
      return false;
    }
    if (sessionDetails.Price === 0) {
      toast.warning("Session price must be greater than 0");
      return false;
    }
    if (sessionDetails.Price > 500) {
      toast.warning("Session price must be under 500 UCOIN");
      return false;
    }
    return true;
  };

  const handleCreateSession = async () => {
    if (!validateFields()) {
      return;
    }

    const res = await createSession(sessionDetails);
    if (res.err) {
      setErr(res.err);
      toast.error(res.err);
    } else {
      toast.success("Session created successfully");
      router.push("/m/mysessions");
    }
  };

  return (
    <ScrollArea className="h-screen w-screen w-full">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/m/mysessions")}
              className="p-1.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Create New Session
            </h1>
          </div>

          {/* Session Title */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Session Title
            </label>
            <EditableField
              value={sessionDetails.title}
              onChange={(value) =>
                setSessionDetails({ ...sessionDetails, title: value })
              }
              placeholder="Enter session title"
              className="w-full p-2.5 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
            />
          </div>

          {/* Session Type and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Session Type
              </label>
              <Select
                onValueChange={(val) =>
                  setSessionDetails({
                    ...sessionDetails,
                    type: val as SessionType,
                  })
                }
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white text-sm h-10 focus:ring-1 focus:ring-orange-500">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {topics.map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                      className="text-sm hover:bg-gray-700 focus:bg-gray-700"
                    >
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Duration
              </label>
              <Select
                onValueChange={(val) => {
                  const duration = parseInt(val);
                  setSessionDetails({
                    ...sessionDetails,
                    DurationInMinutes: duration,
                  });
                }}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white text-sm h-10 focus:ring-1 focus:ring-orange-500">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {[30, 60, 90, 120, 150, 180].map((minutes) => (
                    <SelectItem
                      key={minutes}
                      value={minutes.toString()}
                      className="text-sm hover:bg-gray-700"
                    >
                      {minutes === 30
                        ? "30 minutes"
                        : `${minutes / 60} hour${minutes > 60 ? "s" : ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Medium */}
          <div className="flex gap-6 mb-5">
            <label className="flex items-center space-x-2 text-gray-300 text-sm">
              <Checkbox
                className="w-4 h-4 border-gray-500 data-[state=checked]:bg-orange-500"
                checked={sessionDetails.session_medium.includes("online")}
                onCheckedChange={(checked) => {
                  setSessionDetails({
                    ...sessionDetails,
                    session_medium: checked
                      ? [
                          ...new Set([
                            ...sessionDetails.session_medium,
                            "online" as meeting_medium,
                          ]),
                        ]
                      : sessionDetails.session_medium.filter((m) => m !== "online"),
                  });
                }}
              />
              <span>Online</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300 text-sm">
              <Checkbox
                className="w-4 h-4 border-gray-500 data-[state=checked]:bg-orange-500"
                checked={sessionDetails.session_medium.includes("offline")}
                onCheckedChange={(checked) => {
                  setSessionDetails({
                    ...sessionDetails,
                    session_medium: checked
                      ? [
                          ...new Set([
                            ...sessionDetails.session_medium,
                            "offline" as meeting_medium,
                          ]),
                        ]
                      : sessionDetails.session_medium.filter((m) => m !== "offline"),
                  });
                }}
              />
              <span>Offline</span>
            </label>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              onChange={(e) =>
                setSessionDetails({
                  ...sessionDetails,
                  Description: e.target.value,
                })
              }
              placeholder="Enter session description..."
              className="w-full h-28 p-2.5 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm resize-none"
            />
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Session Price
            </label>
            <p className="text-gray-400 text-xs mb-2">Must be under 500 UCOIN</p>
            <div className="relative">
              <EditableField
                value={sessionDetails.Price.toString()}
                onChange={(value) => {
                  const val = parseInt(value);
                  if (value === "") {
                    setSessionDetails({ ...sessionDetails, Price: 0 });
                  } else if (!isNaN(val) && val >= 1 && val <= 500) {
                    setSessionDetails({ ...sessionDetails, Price: val });
                  }
                }}
                placeholder="0"
                className="w-32 p-2.5 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
              />
              <span className="absolute left-32 top-2.5 ml-2 text-gray-300 text-sm">
                UCOIN
              </span>
            </div>
          </div>

          {/* Create Button and Error */}
          <div className="flex flex-col items-start">
            <button
              onClick={handleCreateSession}
              className="bg-gradient-to-r from-orange-700 to-amber-800 text-white px-5 py-2 rounded-md hover:from-orange-600 hover:to-amber-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-orange-500/20"
            >
              Create Session
            </button>
            {err && (
              <span className="text-orange-400 text-xs mt-2">{err}</span>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default CreateNewSession;