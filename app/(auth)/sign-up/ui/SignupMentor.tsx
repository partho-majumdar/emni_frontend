// "use client";
// import { DateTimePicker } from "@/app/ui/CalendarUI/CustomDateTimePicker";
// import { hover_style, theme_style } from "@/app/ui/CustomStyles";
// import EditableField from "@/app/ui/EditableField";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import {
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { Select } from "@radix-ui/react-select";
// import React, { useState } from "react";
// import { registerMentor } from "../../authActions";
// import { useRouter } from "next/navigation";
// import LoadingSpinner from "@/app/ui/LoadingComponent";

// export type MentorRegisterDataType = {
//   name: string;
//   email: string;
//   username: string;
//   gender: "Male" | "Female" | null;
//   grad_year: string;
//   socials: {
//     github: string;
//     facebook: string;
//     linkedin: string;
//     twitter: string;
//   };
//   bio: string;
//   dob: Date;
//   password: string;
//   repeatPassword: string;
// };

// const style1 =
//   "w-full h-[50px] flex items-center text-2xl bg-orange-800/20 my-5 px-4 text-muted-foreground rounded-xl";

// const SignupMentor = () => {
//   const [info, setInfo] = useState<MentorRegisterDataType>({
//     name: "",
//     email: "",
//     username: "",
//     gender: null,
//     grad_year: "",
//     dob: new Date(),
//     bio: "",
//     password: "",
//     repeatPassword: "",
//     socials: {
//       github: "",
//       facebook: "",
//       linkedin: "",
//       twitter: "",
//     },
//   });
//   const router = useRouter();
//   const [err, setErr] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const handleRegisterMentor = async () => {
//     setLoading(true);
//     const response = await registerMentor(info);
//     if (response.mid) {
//       localStorage.setItem("mentor-id", response.mid);
//       setLoading(false);
//       router.replace("/m/myprofile");
//     } else {
//       setErr(response.error);
//       setLoading(false);
//     }
//   };
//   return (
//     <div className=" flex flex-col ">
//       {err && <span className={`text-red-500`}>{err}</span>}
//       <ScrollArea className="h-[700px] my-5">
//         <span className="text-xl">Information</span>
//         <EditableField
//           value={info.name}
//           onChange={(newValue) => {
//             setInfo((prev) => ({ ...prev, name: newValue }));
//           }}
//           className={style1}
//           placeholder="Full Name"
//           title="name"
//         />

//         <EditableField
//           value={info.email}
//           onChange={(newValue) => {
//             setInfo((prev) => ({ ...prev, email: newValue }));
//           }}
//           className={style1}
//           placeholder="Email Provided By UIU"
//           title="email"
//         />

//         <EditableField
//           value={info.username}
//           onChange={(newValue) => {
//             setInfo((prev) => ({ ...prev, username: newValue }));
//           }}
//           className={style1}
//           placeholder="Username"
//           title="username"
//         />
//         <div className="w-full flex gap-x-4">
//           <Select
//             onValueChange={(val) => {
//               setInfo((prev) => ({
//                 ...prev,
//                 gender: val as "Male" | "Female",
//               }));
//             }}
//           >
//             <SelectTrigger className="bg-orange-800/20 text-orange-500 text-2xl px-3 py-2 border-none w-1/2 h-[50px]">
//               <SelectValue placeholder="Gender" />
//             </SelectTrigger>

//             <SelectContent className="bg-orange-800/20 border-none">
//               <SelectItem className="" value="Male">
//                 Male
//               </SelectItem>
//               <SelectItem value="Female">Female</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select
//             onValueChange={(val) => {
//               setInfo((prev) => ({
//                 ...prev,
//                 grad_year: val,
//               }));
//             }}
//           >
//             <SelectTrigger className="bg-orange-800/20 text-orange-500 text-2xl px-3 py-2 border-none w-1/2 h-[50px]">
//               <SelectValue placeholder="Graduation Year" />
//             </SelectTrigger>

//             <SelectContent className="bg-orange-800/20 border-none">
//               {Array.from(
//                 { length: new Date().getFullYear() - 2002 },
//                 (_, i) => {
//                   const year = 2002 + i;
//                   return (
//                     <SelectItem key={year} value={year.toString()}>
//                       {year}
//                     </SelectItem>
//                   );
//                 },
//               )}
//               {Array.from({ length: 5 }, (_, i) => {
//                 const year = new Date().getFullYear() + i;
//                 return (
//                   <SelectItem key={year} value={year.toString()}>
//                     {year}
//                   </SelectItem>
//                 );
//               })}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="my-4">
//           <DateTimePicker
//             field={{
//               value: info.dob,
//               onChange: (newdate: Date) =>
//                 setInfo((prev) => ({ ...prev, dob: newdate })),
//             }}
//             classnames="bg-orange-800/20 px-4 py-3 rounded-md text-orange-500 text-2xl"
//             timeClock="hide"
//             year={true}
//           />
//         </div>
//         <div className="my-15">
//           <span className="text-xl">Account</span>
//           <EditableField
//             value={info.password}
//             onChange={(newValue) => {
//               setInfo((prev) => ({ ...prev, password: newValue }));
//             }}
//             className={style1}
//             placeholder="Put a password to your account"
//             pass={true}
//             title="Password"
//           />
//           <EditableField
//             value={info.repeatPassword}
//             onChange={(newValue) => {
//               setInfo((prev) => ({ ...prev, repeatPassword: newValue }));
//             }}
//             className={style1}
//             placeholder="Confirm Password"
//             pass={true}
//           />
//         </div>

//         <div>
//           <span className="text-xl">Social Links</span>
//           {["Facebook", "Github", "LinkedIn", "Twitter"].map((s, i) => {
//             const key = s.toLowerCase() as keyof typeof info.socials;
//             return (
//               <span key={i}>
//                 <EditableField
//                   value={info.socials[key]}
//                   onChange={(newValue) => {
//                     setInfo((prev) => ({
//                       ...prev,
//                       socials: {
//                         ...prev.socials,
//                         [key]: newValue,
//                       },
//                     }));
//                   }}
//                   className={style1}
//                   placeholder={s}
//                 />
//               </span>
//             );
//           })}
//         </div>
//         <ScrollBar orientation="vertical" />
//       </ScrollArea>
//       <div className="flex justify-end">
//         <span
//           className={cn(
//             hover_style,
//             theme_style,
//             "px-3 py-1 flex items-center gap-x-2 text-xl rounded-md select-none ",
//           )}
//           onClick={handleRegisterMentor}
//         >
//           {loading && <LoadingSpinner />}
//           Create Account
//         </span>
//       </div>
//     </div>
//   );
// };

// export default SignupMentor;


// --------------------- Above code written by rafi -----------------------





"use client";
import { hover_style, theme_style } from "@/app/ui/CustomStyles";
import EditableField from "@/app/ui/EditableField";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Select } from "@radix-ui/react-select";
import React, { useState } from "react";
import { registerMentor } from "../../authActions";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/ui/LoadingComponent";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";

// Define the type for mentor registration data
export type MentorRegisterDataType = {
  name: string;
  email: string;
  username: string;
  gender: "Male" | "Female" | null;
  grad_year: string;
  socials: {
    github: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  };
  dob: Date;
  password: string;
  repeatPassword: string;
};

const style1 =
  "w-full h-12 flex items-center text-base bg-black my-3 px-4 text-white border border-gray-700 rounded-lg";

const SignupMentor = () => {
  const [info, setInfo] = useState<MentorRegisterDataType>({
    name: "",
    email: "",
    username: "",
    gender: null,
    grad_year: "",
    socials: {
      github: "",
      facebook: "",
      linkedin: "",
      twitter: "",
    },
    dob: new Date(),
    password: "",
    repeatPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const router = useRouter();

  const handleRegisterMentor = async () => {
    // Validate passwords
    if (info.password !== info.repeatPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate required fields
    const missingFields: string[] = [];
    if (!info.name.trim()) missingFields.push("Full Name");
    if (!info.email.trim()) missingFields.push("Email");
    if (!info.username.trim()) missingFields.push("Username");
    if (!info.gender) missingFields.push("Gender");
    if (!info.grad_year) missingFields.push("Graduation Year");
    if (!info.password.trim()) missingFields.push("Password");

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const response = await registerMentor(info);
      if (response.mid) {
        localStorage.setItem("mentor-id", response.mid);
        setLoading(false);
        router.replace("/m/myprofile");
      } else {
        toast.error(response.error || "Registration failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollArea className="h-[calc(100vh-150px)] my-5">
        <div className="px-4 pb-10 space-y-4">
          <span className="text-lg font-medium text-white">Information</span>
          <EditableField
            value={info.name}
            onChange={(newValue) => {
              setInfo((prev) => ({ ...prev, name: newValue }));
            }}
            className={style1}
            placeholder="Full Name"
            title="name"
          />

          <EditableField
            value={info.email}
            onChange={(newValue) => {
              setInfo((prev) => ({ ...prev, email: newValue }));
            }}
            className={style1}
            placeholder="Enter your email"
            title="email"
          />

          <EditableField
            value={info.username}
            onChange={(newValue) => {
              setInfo((prev) => ({ ...prev, username: newValue }));
            }}
            className={style1}
            placeholder="Username"
            title="username"
          />

          <div className="w-full flex gap-x-4">
            <Select
              onValueChange={(val) => setInfo(prev => ({ ...prev, gender: val as "Male" | "Female" }))}
            >
              <SelectTrigger className={cn(style1, "w-1/2")}>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-gray-700 text-white">
                <SelectItem 
                  value="Male"
                  className="hover:bg-gray-800 focus:bg-gray-800"
                >
                  Male
                </SelectItem>
                <SelectItem 
                  value="Female"
                  className="hover:bg-gray-800 focus:bg-gray-800"
                >
                  Female
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(val) => setInfo(prev => ({ ...prev, grad_year: val }))}
            >
              <SelectTrigger className={cn(style1, "w-1/2")}>
                <SelectValue placeholder="Graduation Year" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-gray-700 text-white max-h-[300px]">
                {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                  const year = 1900 + i;
                  return (
                    <SelectItem 
                      key={year} 
                      value={year.toString()}
                      className="hover:bg-gray-800 focus:bg-gray-800"
                    >
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="my-4 space-y-2">
            <span className="text-base font-medium block mb-2 text-white">Date of Birth</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !info.dob && "text-gray-400",
                    "bg-black border border-gray-700 hover:bg-gray-800 text-white rounded-lg px-4 py-2"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                  {info.dob ? format(info.dob, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black border border-gray-700 rounded-lg">
                {!selectedYear ? (
                  <div className="p-4 bg-black rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-4">Select Year</h3>
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                          const year = 1900 + i;
                          return (
                            <Button
                              key={year}
                              variant={"ghost"}
                              className={cn(
                                "bg-black hover:bg-gray-800 text-white rounded-sm",
                                selectedYear === year && "bg-gray-700 text-white"
                              )}
                              onClick={() => setSelectedYear(year)}
                            >
                              {year}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                ) : !selectedMonth ? (
                  <div className="p-4 bg-black rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedYear(null)}
                        className="text-white hover:bg-gray-800 rounded-sm"
                      >
                        ← Back
                      </Button>
                      <h3 className="text-lg font-medium text-white">{selectedYear}</h3>
                      <div className="w-10"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        return (
                          <Button
                            key={month}
                            variant={"ghost"}
                            className={cn(
                              "bg-black hover:bg-gray-800 text-white rounded-sm",
                              selectedMonth === month && "bg-gray-700 text-white"
                            )}
                            onClick={() => setSelectedMonth(month)}
                          >
                            {format(new Date(selectedYear, month - 1, 1), "MMM")}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-0 bg-black rounded-lg">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMonth(null)}
                        className="text-white hover:bg-gray-800 rounded-sm"
                      >
                        ← Back
                      </Button>
                      <h3 className="text-lg font-medium text-white">
                        {format(new Date(selectedYear, selectedMonth - 1, 1), "MMMM yyyy")}
                      </h3>
                      <div className="w-10"></div>
                    </div>
                    <Calendar
                      mode="single"
                      month={new Date(selectedYear, selectedMonth - 1)}
                      onMonthChange={(date) => {
                        setSelectedYear(date.getFullYear());
                        setSelectedMonth(date.getMonth() + 1);
                      }}
                      selected={info.dob || undefined}
                      onSelect={(date) => {
                        if (date) {
                          setInfo((prev) => ({ ...prev, dob: date }));
                        }
                      }}
                      className="border-0 bg-black p-4"
                      classNames={{
                        months: "flex flex-col sm:flex-row gap-4",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium text-white",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-black hover:bg-gray-800 text-white rounded-sm",
                        table: "w-full border-collapse",
                        head_row: "grid grid-cols-7 gap-1 text-white",
                        head_cell: "text-sm font-bold text-white w-9 h-9 flex items-center justify-center",
                        row: "grid grid-cols-7 gap-1 mt-2",
                        cell: "text-center text-sm p-0 relative w-9 h-9",
                        day: "h-9 w-9 p-0 font-normal rounded-sm hover:bg-gray-800 text-white",
                        day_selected: "bg-gray-700 hover:bg-gray-600 text-white rounded-sm",
                        day_today: "border border-gray-500 text-white",
                        day_outside: "text-gray-500 opacity-50",
                        day_disabled: "text-gray-500 opacity-50",
                        day_range_middle: "bg-gray-700/50 text-white",
                      }}
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <span className="text-lg font-medium text-white">Social Media</span>
            <EditableField
              value={info.socials.github}
              onChange={(newValue) => {
                setInfo((prev) => ({
                  ...prev,
                  socials: { ...prev.socials, github: newValue },
                }));
              }}
              className={style1}
              placeholder="GitHub URL"
              title="github"
            />
            <EditableField
              value={info.socials.linkedin}
              onChange={(newValue) => {
                setInfo((prev) => ({
                  ...prev,
                  socials: { ...prev.socials, linkedin: newValue },
                }));
              }}
              className={style1}
              placeholder="LinkedIn URL"
              title="linkedin"
            />
            <EditableField
              value={info.socials.facebook}
              onChange={(newValue) => {
                setInfo((prev) => ({
                  ...prev,
                  socials: { ...prev.socials, facebook: newValue },
                }));
              }}
              className={style1}
              placeholder="Facebook URL"
              title="facebook"
            />
            <EditableField
              value={info.socials.twitter}
              onChange={(newValue) => {
                setInfo((prev) => ({
                  ...prev,
                  socials: { ...prev.socials, twitter: newValue },
                }));
              }}
              className={style1}
              placeholder="Twitter URL"
              title="twitter"
            />
          </div>

          <div className="space-y-4">
            <span className="text-lg font-medium text-white">Account</span>
            <EditableField
              value={info.password}
              onChange={(newValue) => {
                setInfo((prev) => ({ ...prev, password: newValue }));
              }}
              className={style1}
              placeholder="Password"
              pass={true}
              title="Password"
            />
            <EditableField
              value={info.repeatPassword}
              onChange={(newValue) => {
                setInfo((prev) => ({ ...prev, repeatPassword: newValue }));
              }}
              className={style1}
              placeholder="Confirm Password"
              pass={true}
            />
          </div>

          <div className="flex flex-col items-center mt-6 space-y-4">
            <button
              className={cn(
                hover_style,
                theme_style,
                "px-6 py-3 flex items-center gap-x-2 text-lg rounded-lg select-none bg-orange-800/30 w-full justify-center max-w-md"
              )}
              onClick={handleRegisterMentor}
            >
              {loading && <LoadingSpinner />}
              Create Account
            </button>

            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-orange-500 hover:underline">
                Sign-in
              </Link>
            </div>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default SignupMentor;


