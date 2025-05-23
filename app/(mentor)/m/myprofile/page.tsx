// "use client";
// import { getMyProfileDetailsMentor } from "@/app/lib/fetchers/mentor";
// import { updateMentorProfile } from "@/app/lib/mutations/mentor";
// import { MentorInfoType } from "@/app/types";
// import { hover_style, smooth_hover, theme_style } from "@/app/ui/CustomStyles";
// import EditableField from "@/app/ui/EditableField";
// import ImageUploader from "@/app/ui/ImageUploader";
// import InterestBox from "@/app/ui/InterestBoxUI/InterestBox";
// import {
//   RowBorderedBox,
//   RowBorderedBoxHeader,
//   RowBorderedBoxRow,
// } from "@/app/ui/RowBorderedBox";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import { toast } from "sonner";

// const MyProfile = () => {
//   const [myProfile, setMyProfile] = useState<MentorInfoType | null>(null);
//   const [unsaved, setUnsaved] = useState<boolean>(false);
//   const [image, setImage] = useState<File | null>(null);

//   useEffect(() => {
//     const fn = async () => {
//       const p: MentorInfoType = await getMyProfileDetailsMentor();
//       setMyProfile(p);
//     };
//     fn();
//   }, []);

//   const handleSave = async () => {
//     try {
//       if (myProfile) {
//         await updateMentorProfile(myProfile, null);
//         setUnsaved(false);
//         toast.success("Profile updated successfully");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   const updateProfilePicture = async () => {
//     try {
//       if (image && myProfile) {
//         await updateMentorProfile(myProfile, image);
//         toast.success("Profile picture updated successfully");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (myProfile) {
//     return (
//       <div className="flex flex-col items-center relative">
//         {unsaved && (
//           <div
//             onClick={handleSave}
//             className="w-full bg-orange-800/10 py-1 mb-5 absolute  flex justify-center"
//           >
//             <span
//               className={cn(
//                 hover_style,
//                 theme_style,
//                 "py-1 px-2 rounded-md select-none",
//               )}
//             >
//               Save Changes
//             </span>
//           </div>
//         )}
//         <div className="flex gap-x-4 items-center justify-end p-3 w-1/2 mt-10">
//           <div className="flex flex-col bg-orange-800/30   rounded-md">
//             <span className="text-4xl py-2 font-bold px-6 text-orange-500">
//               {myProfile.name}
//             </span>
//             <span className="text-xl py-2 px-6 border-t border-orange-500/20">
//               {myProfile.email}
//             </span>
//             <Dialog>
//               <DialogTrigger>
//                 <span className="text-sm py-2 px-6 border-t border-orange-500/20 flex justify-center hover:opacity-70 text-muted-foreground select-none">
//                   Change Profile Picture
//                 </span>
//               </DialogTrigger>
//               <DialogContent className="min-w-[500px]">
//                 <DialogTitle>Update Profile Picture</DialogTitle>
//                 <div className="flex">
//                   <div>
//                     <span className="text-sm py-2 px-6 flex justify-center hover:opacity-70 text-muted-foreground select-none">
//                       <ImageUploader
//                         source={myProfile.image_link}
//                         setImage={(img) => {
//                           setImage(img);
//                         }}
//                         image={image}
//                       />
//                     </span>
//                   </div>
//                 </div>
//                 <DialogClose onClick={updateProfilePicture}>Done</DialogClose>
//               </DialogContent>
//             </Dialog>
//           </div>

//           <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-2 border-orange-800">
//             <Image
//               src={myProfile.image_link}
//               alt=""
//               width={200}
//               height={200}
//               className="object-cover w-full h-full"
//               unoptimized
//             />
//           </div>
//         </div>

//         <div className="w-1/2">
//           <RowBorderedBox>
//             <RowBorderedBoxHeader>
//               <span className="text-3xl font-semibold">Bio</span>
//             </RowBorderedBoxHeader>
//             <RowBorderedBoxRow>
//               <span>
//                 <EditableField
//                   onChange={(newVal) => {
//                     setUnsaved(true);
//                     setMyProfile((prev) =>
//                       prev ? { ...prev, bio: newVal } : null,
//                     );
//                   }}
//                   value={myProfile.bio || ""}
//                   placeholder="Enter your bio"
//                   editIcon
//                 />
//               </span>
//             </RowBorderedBoxRow>
//           </RowBorderedBox>
//           <InterestBox role="mentor" />
//         </div>
//       </div>
//     );
//   }
// };

// export default MyProfile;

// ------------------------- above code written by rafi -------------------























"use client";
import { getMyProfileDetailsMentor } from "@/app/lib/fetchers/mentor";
import { updateMentorProfile } from "@/app/lib/mutations/mentor";
import { MentorInfoType } from "@/app/types";
import { hover_style, smooth_hover, theme_style } from "@/app/ui/CustomStyles";
import EditableField from "@/app/ui/EditableField";
import ImageUploader from "@/app/ui/ImageUploader";
import InterestBox from "@/app/ui/InterestBoxUI/InterestBox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MyProfile = () => {
  const [myProfile, setMyProfile] = useState<MentorInfoType | null>(null);
  const [unsaved, setUnsaved] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);

  useEffect(() => {
    const fn = async () => {
      try {
        const p: MentorInfoType = await getMyProfileDetailsMentor();
        setMyProfile(p);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile details");
      }
    };
    fn();
  }, []);

  const handleSave = async () => {
    try {
      if (myProfile) {
        await updateMentorProfile(myProfile, null);
        setUnsaved(false);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const updateProfilePicture = async () => {
    try {
      if (image && myProfile) {
        if (image.size > 5 * 1024 * 1024) {
          toast.error("Image size exceeds 5MB limit");
          return;
        }
        await updateMentorProfile(myProfile, image);
        setImage(null);
        toast.success("Profile picture updated successfully");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile picture");
    }
  };

  if (!myProfile) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-[100vh] w-full bg-black">
      {unsaved && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={handleSave}
            className={cn(
              hover_style,
              smooth_hover,
              theme_style,
              "py-2 px-6 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-base font-medium shadow-lg"
            )}
          >
            Save Changes
          </button>
        </div>
      )}

      {/* <ScrollArea className="h-[calc(111vh-70px)] w-full"> */}
      <ScrollArea className="h-screen w-screen w-full">
        <div className="flex flex-col items-center py-8 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto min-h-[calc(100vh-70px)]">
          {/* Profile Header Section */}
          <div className="w-full bg-gray-900 border border-orange-600/30 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500/80 shadow-lg">
                  {imageError ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-400">
                      <span className="text-sm">Image Failed to Load</span>
                    </div>
                  ) : (
                    <Image
                      src={myProfile.image_link || "/placeholder.png"} // Fallback to a placeholder image
                      alt="Profile"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium py-1 px-3 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100">
                      Edit
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 text-white border border-orange-600/50 max-w-md">
                    <DialogTitle className="text-xl text-orange-500 font-semibold">
                      Update Profile Picture
                    </DialogTitle>
                    <div className="flex flex-col items-center gap-4 py-4">
                      <ImageUploader
                        source={myProfile.image_link || "/placeholder.png"} // Fallback to placeholder
                        setImage={(img) => setImage(img)}
                        image={image}
                      />
                      <DialogClose
                        onClick={updateProfilePicture}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-md text-base font-medium w-full"
                      >
                        Update Picture
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-orange-500 mb-2">{myProfile.name}</h1>
                <p className="text-lg text-gray-300 mb-1">{myProfile.username}</p>
                <p className="text-lg text-gray-300 mb-4">{myProfile.email}</p>
                <p className="text-gray-400 max-w-2xl">{myProfile.bio || "No bio yet. Click to add one..."}</p>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900 border border-orange-600/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-orange-500 mb-6 pb-2 border-b border-orange-600/30">
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Username</label>
                      <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        {myProfile.username || "No username set"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <EditableField
                        onChange={(newVal) => {
                          setUnsaved(true);
                          setMyProfile((prev) => (prev ? { ...prev, name: newVal } : null));
                        }}
                        value={myProfile.name || ""}
                        placeholder="Your name"
                        className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Gender</label>
                    <Select
                      value={myProfile?.gender || undefined}
                      onValueChange={(val) => {
                        setUnsaved(true);
                        setMyProfile(prev => prev ? { ...prev, gender: val as "Male" | "Female" } : null);
                      }}
                    >
                      <SelectTrigger className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-lg px-4 py-2 text-white h-11 text-base">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-700 text-white text-base">
                        <SelectItem 
                          value="Male"
                          className="hover:bg-gray-800 focus:bg-gray-800 px-4 py-2 text-base"
                        >
                          Male
                        </SelectItem>
                        <SelectItem 
                          value="Female"
                          className="hover:bg-gray-800 focus:bg-gray-800 px-4 py-2 text-base"
                        >
                          Female
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        {myProfile.email || "No email set"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !myProfile.dob && "text-muted-foreground",
                              "bg-gray-900 border border-gray-700 hover:bg-gray-700/50 text-white rounded-md"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {myProfile.dob ? format(myProfile.dob, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border border-gray-700 rounded-md">
                          {!selectedYear ? (
                            <div className="p-4 bg-gray-900 rounded-md">
                              <h3 className="text-lg font-medium text-orange-500 mb-4">Select Year</h3>
                              <ScrollArea className="h-[300px]">
                                <div className="grid grid-cols-4 gap-2">
                                  {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                                    const year = 1900 + i;
                                    return (
                                      <Button
                                        key={year}
                                        variant={"ghost"}
                                        className={cn(
                                          "bg-gray-900 hover:bg-orange-600 hover:text-white rounded-sm",
                                          selectedYear === year && "bg-orange-600 text-white"
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
                            <div className="p-4 bg-gray-900 rounded-md">
                              <div className="flex items-center justify-between mb-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedYear(null)}
                                  className="text-orange-500 hover:bg-orange-500/10 rounded-sm"
                                >
                                  ← Back
                                </Button>
                                <h3 className="text-lg font-medium text-orange-500">{selectedYear}</h3>
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
                                        "bg-gray-900 hover:bg-orange-600 hover:text-white rounded-sm",
                                        selectedMonth === month && "bg-orange-600 text-white"
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
                            <div className="p-0 bg-gray-900 rounded-md">
                              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedMonth(null)}
                                  className="text-orange-500 hover:bg-orange-500/10 rounded-sm"
                                >
                                  ← Back
                                </Button>
                                <h3 className="text-lg font-medium text-orange-500">
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
                                selected={myProfile.dob || undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setUnsaved(true);
                                    setMyProfile((prev) => (prev ? { ...prev, dob: date } : null));
                                  }
                                }}
                                className="border-0 bg-gray-900 p-4"
                                classNames={{
                                  months: "flex flex-col sm:flex-row gap-4",
                                  month: "space-y-4 w-full",
                                  caption: "flex justify-center pt-1 relative items-center",
                                  caption_label: "text-sm font-medium text-orange-500",
                                  nav: "space-x-1 flex items-center",
                                  nav_button: "h-7 w-7 bg-gray-900 hover:bg-orange-600 text-white rounded-sm",
                                  table: "w-full border-collapse",
                                  head_row: "grid grid-cols-7 gap-1 text-orange-500",
                                  head_cell: "text-sm font-bold text-orange-500 w-9 h-9 flex items-center justify-center",
                                  row: "grid grid-cols-7 gap-1 mt-2",
                                  cell: "text-center text-sm p-0 relative w-9 h-9",
                                  day: "h-9 w-9 p-0 font-normal rounded-sm hover:bg-gray-700 hover:text-white",
                                  day_selected: "bg-orange-600 hover:bg-orange-700 text-white rounded-sm",
                                  day_today: "border border-orange-500 text-orange-500",
                                  day_outside: "text-gray-500 opacity-50",
                                  day_disabled: "text-gray-500 opacity-50",
                                  day_range_middle: "bg-orange-600/50 text-white",
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Graduation Year</label>
                      <Select
                        value={myProfile?.grad_year?.toString() || undefined}
                        onValueChange={(val) => {
                          setUnsaved(true);
                          setMyProfile(prev => prev ? { ...prev, grad_year: parseInt(val) } : null);
                        }}
                      >
                        <SelectTrigger className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-md px-3 py-1.5 text-white h-11 text-base">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border border-gray-700 text-white max-h-[300px] text-sm">
                          {Array.from({ length: 3000 - 1900 + 1 }, (_, i) => {
                            const year = 1900 + i;
                            return (
                              <SelectItem 
                                key={year} 
                                value={year.toString()}
                                className="hover:bg-gray-800 focus:bg-gray-800 px-3 py-1.5"
                              >
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-orange-600/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-orange-500 mb-4 pb-2 border-b border-orange-600/30">
                  About Me
                </h2>
                <EditableField
                  onChange={(newVal) => {
                    setUnsaved(true);
                    setMyProfile((prev) => (prev ? { ...prev, bio: newVal } : null));
                  }}
                  value={myProfile.bio || ""}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[120px] bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="bg-gray-900 border border-orange-600/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-orange-500 mb-6 pb-2 border-b border-orange-600/30">
                  Social Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "GitHub", key: "github" },
                    { label: "LinkedIn", key: "linkedin" },
                    { label: "Twitter", key: "twitter" },
                    { label: "Facebook", key: "facebook" },
                  ].map((social) => (
                    <div key={social.key}>
                      <label className="block text-sm text-gray-400 mb-1">{social.label}</label>
                      <EditableField
                        onChange={(newVal) => {
                          setUnsaved(true);
                          setMyProfile((prev) =>
                            prev ? { ...prev, socials: { ...prev.socials, [social.key]: newVal } } : null
                          );
                        }}
                        value={myProfile.socials[social.key as keyof typeof myProfile.socials] || ""}
                        placeholder={`Your ${social.label} URL`}
                        className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 border border-orange-600/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-orange-500 mb-4 pb-2 border-b border-orange-600/30">
                  Account Security
                </h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <EditableField
                    onChange={(newVal) => {
                      setUnsaved(true);
                      setMyProfile((prev) => (prev ? { ...prev, password: newVal } : null));
                    }}
                    value={myProfile.password || ""}
                    placeholder="Update your password"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div className="bg-gray-900 border border-orange-600/30 rounded-xl p-6 shadow-lg h-auto">
                <h2 className="text-xl font-semibold text-orange-500 mb-4 pb-2 border-b border-orange-600/30">
                  My Interests
                </h2>
                <div className="text-sm">
                  <InterestBox
                    role="mentor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MyProfile;