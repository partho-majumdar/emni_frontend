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
// import { toast } from "sonner";
// import { updateSession } from "@/app/lib/mutations/mentor";
// import LoadingSpinner from "@/app/ui/LoadingComponent";

// const topics = [
//   "Course Topic Tuition",
//   "Project Help",
//   "Career Guidance",
//   "Competition Prep",
//   "Productivity",
//   "ECA",
//   "Resume Review",
//   "Research Guidance",
//   "Mock Interview",
// ];
// type Props = {
//   SessionDetails: SessionInfoType;
//   updateSessionDetails?: (session: SessionInfoType) => void;
// };
// const EditSession = ({ SessionDetails, updateSessionDetails }: Props) => {
//   const [sessionDetails, setSessionDetails] =
//     useState<SessionInfoType>(SessionDetails);
//   const [message, setMessage] = useState<string | null>("");
//   const [loading, setLoading] = useState(false);
//   const handleUpdateSession = async () => {
//     setLoading(true);
//     const res = await updateSession(sessionDetails);
//     if (res) {
//       toast.success("Session updated successfully");
//       setMessage("Session updated successfully");
//       if (updateSessionDetails) {
//         updateSessionDetails(sessionDetails);
//       }
//       setLoading(false);
//     } else {
//       toast.error("Failed to update session");
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="">
//       <div>
//         <EditableField
//           value={sessionDetails.title}
//           onChange={(value) =>
//             setSessionDetails({ ...sessionDetails, title: value })
//           }
//           placeholder="Session Title"
//           className=" text-3xl py-2 border rounded-lg w-full px-3"
//         />
//         <div className="flex gap-x-4 my-5">
//           <Select
//             onValueChange={(val) =>
//               setSessionDetails({
//                 ...sessionDetails,
//                 type: val as SessionType,
//               })
//             }
//             value={sessionDetails.type}
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
//             value={sessionDetails.DurationInMinutes.toString()}
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
//               checked={sessionDetails.session_medium.includes("online")}
//               onCheckedChange={(b) => {
//                 if (!b && sessionDetails.session_medium.includes("online")) {
//                   setSessionDetails({
//                     ...sessionDetails,
//                     session_medium: sessionDetails.session_medium.filter(
//                       (m) => m !== "online",
//                     ),
//                   });
//                 }
//               }}
//             />
//             <span className="ml-2">Online</span>
//           </span>

//           <span className="flex h-full items-center">
//             <Checkbox
//               className="w-5 h-5"
//               checked={sessionDetails.session_medium.includes("offline")}
//               onCheckedChange={(b) => {
//                 if (!b && sessionDetails.session_medium.includes("offline")) {
//                   setSessionDetails({
//                     ...sessionDetails,
//                     session_medium: sessionDetails.session_medium.filter(
//                       (m) => m !== "offline",
//                     ),
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
//             value={sessionDetails.Description}
//             placeholder="Description"
//             className="my-10 text-xl w-full h-[200px] p-5 border rounded-lg border focus:outline-none"
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
//                   Price: 0, 
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
//           <div className="flex gap-x-2 items-center">
//             <span
//               className={`${theme_style}  rounded-lg p-2 my-5 cursor-pointer hover:opacity-70 ${smooth_hover} text-lg`}
//               onClick={handleUpdateSession}
//             >
//               Update
//             </span>
//             {loading && <LoadingSpinner />}
//           </div>
//           {message && <div className="text-green-500 mt-2">{message}</div>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditSession;


// ---------------------- above code written by rafi --------------------

"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { SessionInfoType, SessionType } from "@/app/types";
import EditableField from "@/app/ui/EditableField";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { smooth_hover, theme_style } from "@/app/ui/CustomStyles";
import { toast } from "sonner";
import { updateSession } from "@/app/lib/mutations/mentor";
import LoadingSpinner from "@/app/ui/LoadingComponent";

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

type Props = {
  SessionDetails: SessionInfoType;
  updateSessionDetails?: (session: SessionInfoType) => void;
  onClose?: () => void; 
};

const EditSession = ({ SessionDetails, updateSessionDetails, onClose }: Props) => {
  const [sessionDetails, setSessionDetails] =
    useState<SessionInfoType>(SessionDetails);
  const [message, setMessage] = useState<string | null>("");
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    if (!sessionDetails.title.trim()) {
      toast.warning("Session title is required");
      return false;
    }
    if (!sessionDetails.type) {
      toast.warning("Session type is required");
      return false;
    }
    if (!sessionDetails.DurationInMinutes) {
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
    return true;
  };

  const handleUpdateSession = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    const res = await updateSession(sessionDetails);
    if (res) {
      toast.success("Session updated successfully");
      setMessage("Session updated successfully");
      if (updateSessionDetails) {
        updateSessionDetails(sessionDetails);
      }
      // Trigger modal close
      if (onClose) {
        onClose(); 
      } else {
        const closeButton = document.querySelector(".modal-close-button");
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      }
      setLoading(false);
    } else {
      toast.error("Failed to update session");
      setLoading(false);
    }
  };

  const handleCheckboxChange = (medium: "online" | "offline", checked: boolean) => {
    setSessionDetails((prev) => {
      let updatedMedium = [...prev.session_medium];
      if (checked && !updatedMedium.includes(medium)) {
        updatedMedium.push(medium);
      } else if (!checked && updatedMedium.includes(medium)) {
        updatedMedium = updatedMedium.filter((m) => m !== medium);
      }
      return { ...prev, session_medium: updatedMedium };
    });
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="space-y-5">
        <EditableField
          value={sessionDetails.title}
          onChange={(value) =>
            setSessionDetails({ ...sessionDetails, title: value })
          }
          placeholder="Session Title"
          className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-x-3">
          <Select
            onValueChange={(val) =>
              setSessionDetails({
                ...sessionDetails,
                type: val as SessionType,
              })
            }
            value={sessionDetails.type}
          >
            <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700 rounded-md focus:ring-orange-500 text-sm">
              <SelectValue placeholder="Session Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              {topics.map((t) => (
                <SelectItem key={t} value={t} className="hover:bg-orange-500/20 text-sm">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val) => {
              const duration = parseInt(val);
              setSessionDetails({
                ...sessionDetails,
                DurationInMinutes: duration,
              });
            }}
            value={sessionDetails.DurationInMinutes.toString()}
          >
            <SelectTrigger className="w-32 bg-gray-800 text-white border-gray-700 rounded-md focus:ring-orange-500 text-sm">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="30" className="hover:bg-orange-500/20 text-sm">30 minutes</SelectItem>
              <SelectItem value="60" className="hover:bg-orange-500/20 text-sm">1 hour</SelectItem>
              <SelectItem value="90" className="hover:bg-orange-500/20 text-sm">1.5 hours</SelectItem>
              <SelectItem value="120" className="hover:bg-orange-500/20 text-sm">2 hours</SelectItem>
              <SelectItem value="150" className="hover:bg-orange-500/20 text-sm">2.5 hours</SelectItem>
              <SelectItem value="180" className="hover:bg-orange-500/20 text-sm">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-x-4 text-sm text-gray-300 items-center">
          <label className="flex items-center gap-x-2">
            <Checkbox
              className="w-4 h-4 border-gray-600 text-orange-500"
              checked={sessionDetails.session_medium.includes("online")}
              onCheckedChange={(checked) => handleCheckboxChange("online", !!checked)}
            />
            Online
          </label>
          <label className="flex items-center gap-x-2">
            <Checkbox
              className="w-4 h-4 border-gray-600 text-orange-500"
              checked={sessionDetails.session_medium.includes("offline")}
              onCheckedChange={(checked) => handleCheckboxChange("offline", !!checked)}
            />
            Offline
          </label>
        </div>
        <div>
          <textarea
            onChange={(e) =>
              setSessionDetails({
                ...sessionDetails,
                Description: e.target.value,
              })
            }
            value={sessionDetails.Description}
            placeholder="Description"
            className="w-full h-28 p-3 text-sm text-white bg-gray-800 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-gray-300">Set session price</label>
          <p className="text-xs text-gray-500">Price must be under 500 UCOIN</p>
          <EditableField
            value={sessionDetails.Price.toString()}
            onChange={(value) => {
              const val = parseInt(value);

              if (value === "") {
                setSessionDetails({
                  ...sessionDetails,
                  Price: 0,
                });
                return;
              }

              if (!isNaN(val)) {
                if (val >= 1 && val <= 500) {
                  setSessionDetails({
                    ...sessionDetails,
                    Price: val,
                  });
                }
              }
            }}
            placeholder="Price"
            className="text-base text-white bg-gray-800 border-gray-700 border rounded-md w-40 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex items-center gap-x-3">
          <button
            className={`${theme_style} bg-orange-500 text-white rounded-md px-3 py-1.5 hover:bg-orange-600 transition-colors duration-200 text-sm font-medium`}
            onClick={handleUpdateSession}
          >
            Update
          </button>
          {loading && <LoadingSpinner />}
          {message && <div className="text-orange-400 text-xs">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default EditSession;