"use client";
import { getMyProfileDetailsMentor, getUcoinBalance } from "@/app/lib/fetchers/mentor";
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
import { Calendar as CalendarIcon, Coins, Edit3, Camera, Github, Linkedin, Twitter, Facebook, Shield, User, Mail, MapPin, Cake, GraduationCap } from "lucide-react";
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
  const [coinBalance, setCoinBalance] = useState<number>(0); // Added state for UCOIN balance

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchProfileAndBalance = async () => {
      try {
        const p: MentorInfoType = await getMyProfileDetailsMentor();
        setMyProfile(p);
        const balance = await getUcoinBalance();
        setCoinBalance(balance);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile details or balance");
        setCoinBalance(0);
      }
    };

    // Initial fetch
    fetchProfileAndBalance();

    // Poll for balance updates every 30 seconds
    intervalId = setInterval(async () => {
      try {
        const balance = await getUcoinBalance();
        setCoinBalance(balance);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update UCOIN balance");
      }
    }, 30000); // 30-second interval

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
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
        setImageError(false); // Reset imageError after successful update
        toast.success("Profile picture updated successfully");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile picture");
    }
  };

  if (!myProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Floating Save Button */}
      {unsaved && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2">
          <button
            onClick={handleSave}
            className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Save Changes
            </span>
          </button>
        </div>
      )}

      <ScrollArea className="h-screen w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Profile Section */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gray-900/60 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl">
                    {imageError ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    ) : (
                      <Image
                        src={myProfile.image_link || "/placeholder.png"}
                        alt="Profile"
                        width={160}
                        height={160}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="absolute bottom-2 right-2 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transform hover:scale-110 transition-all duration-200">
                        <Camera className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl text-white">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        Update Profile Picture
                      </DialogTitle>
                      <div className="flex flex-col items-center gap-6 py-6">
                        <ImageUploader
                          source={myProfile.image_link || "/placeholder.png"}
                          setImage={(img) => setImage(img)}
                          image={image}
                        />
                        <DialogClose
                          onClick={updateProfilePicture}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
                        >
                          Update Picture
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                      {myProfile.name}
                    </h1>
                    <p className="text-lg text-orange-400 font-medium">@{myProfile.username}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span>{myProfile.email}</span>
                    </div>
                    {myProfile.dob && (
                      <div className="flex items-center gap-2">
                        <Cake className="w-4 h-4 text-orange-500" />
                        <span>{format(myProfile.dob, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                    {myProfile.bio || "No bio yet. Click to add one and tell the world about yourself..."}
                  </p>
                </div>

                {/* UCOIN Balance */}
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 text-center min-w-[200px]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-6 h-6 text-orange-400" />
                    <span className="text-sm text-gray-300 font-medium">Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-400 mb-1">{coinBalance}</div>
                  <div className="text-sm text-orange-300 font-medium">UCOIN</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="xl:col-span-2 space-y-8">
              {/* Personal Details */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <User className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Personal Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <User className="w-4 h-4 text-orange-500" />
                        Username
                      </label>
                      <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white font-medium">
                        {myProfile.username || "No username set"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Edit3 className="w-4 h-4 text-orange-500" />
                        Full Name
                      </label>
                      <EditableField
                        onChange={(newVal) => {
                          setUnsaved(true);
                          setMyProfile((prev) => (prev ? { ...prev, name: newVal } : null));
                        }}
                        value={myProfile.name || ""}
                        placeholder="Your full name"
                        className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <User className="w-4 h-4 text-orange-500" />
                        Gender
                      </label>
                      <Select
                        value={myProfile?.gender || undefined}
                        onValueChange={(val) => {
                          setUnsaved(true);
                          setMyProfile(prev => prev ? { ...prev, gender: val as "Male" | "Female" } : null);
                        }}
                      >
                        <SelectTrigger className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white h-12">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 text-white rounded-xl">
                          <SelectItem value="Male" className="hover:bg-gray-800 focus:bg-gray-800 rounded-lg">
                            Male
                          </SelectItem>
                          <SelectItem value="Female" className="hover:bg-gray-800 focus:bg-gray-800 rounded-lg">
                            Female
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Mail className="w-4 h-4 text-orange-500" />
                        Email Address
                      </label>
                      <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white font-medium">
                        {myProfile.email || "No email set"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Cake className="w-4 h-4 text-orange-500" />
                        Date of Birth
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-medium h-12",
                              !myProfile.dob && "text-gray-400",
                              "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 text-white rounded-xl transition-all duration-200"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-orange-500" />
                            {myProfile.dob ? format(myProfile.dob, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl">
                          {!selectedYear ? (
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-orange-500 mb-4">Select Year</h3>
                              <ScrollArea className="h-[300px]">
                                <div className="grid grid-cols-4 gap-2">
                                  {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                                    const year = 1900 + i;
                                    return (
                                      <Button
                                        key={year}
                                        variant="ghost"
                                        className="h-10 bg-gray-800/50 hover:bg-orange-500 hover:text-white rounded-lg transition-all duration-200"
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
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedYear(null)}
                                  className="text-orange-500 hover:bg-orange-500/10 rounded-lg"
                                >
                                  ← Back
                                </Button>
                                <h3 className="text-lg font-semibold text-orange-500">{selectedYear}</h3>
                                <div className="w-16"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 12 }, (_, i) => {
                                  const month = i + 1;
                                  return (
                                    <Button
                                      key={month}
                                      variant="ghost"
                                      className="h-12 bg-gray-800/50 hover:bg-orange-500 hover:text-white rounded-lg transition-all duration-200"
                                      onClick={() => setSelectedMonth(month)}
                                    >
                                      {format(new Date(selectedYear, month - 1, 1), "MMM")}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedMonth(null)}
                                  className="text-orange-500 hover:bg-orange-500/10 rounded-lg"
                                >
                                  ← Back
                                </Button>
                                <h3 className="text-lg font-semibold text-orange-500">
                                  {format(new Date(selectedYear, selectedMonth - 1, 1), "MMMM yyyy")}
                                </h3>
                                <div className="w-16"></div>
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
                                className="p-4"
                                classNames={{
                                  day_selected: "bg-orange-500 hover:bg-orange-600 text-white rounded-lg",
                                  day_today: "border border-orange-500 text-orange-500 rounded-lg",
                                  day: "hover:bg-gray-700 rounded-lg transition-colors",
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <GraduationCap className="w-4 h-4 text-orange-500" />
                        Graduation Year
                      </label>
                      <Select
                        value={myProfile?.grad_year?.toString() || undefined}
                        onValueChange={(val) => {
                          setUnsaved(true);
                          setMyProfile(prev => prev ? { ...prev, grad_year: parseInt(val) } : null);
                        }}
                      >
                        <SelectTrigger className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white h-12">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 text-white max-h-[300px] rounded-xl">
                          {Array.from({ length: 3000 - 1900 + 1 }, (_, i) => {
                            const year = 1900 + i;
                            return (
                              <SelectItem 
                                key={year} 
                                value={year.toString()}
                                className="hover:bg-gray-800 focus:bg-gray-800 rounded-lg"
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

              {/* About Me */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Edit3 className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">About Me</h2>
                </div>
                <EditableField
                  onChange={(newVal) => {
                    setUnsaved(true);
                    setMyProfile((prev) => (prev ? { ...prev, bio: newVal } : null));
                  }}
                  value={myProfile.bio || ""}
                  placeholder="Tell the world about yourself, your passions, and what makes you unique..."
                  className="w-full min-h-[150px] bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-4 text-white leading-relaxed transition-all duration-200"
                />
              </div>

              {/* Social Links */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <User className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Social Links</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "GitHub", key: "github" },
                    { label: "LinkedIn", key: "linkedin" },
                    { label: "Twitter", key: "twitter" },
                    { label: "Facebook", key: "facebook" },
                  ].map((social) => (
                    <div key={social.key} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        {getSocialIcon(social.key)}
                        {social.label}
                      </label>
                      <EditableField
                        onChange={(newVal) => {
                          setUnsaved(true);
                          setMyProfile((prev) =>
                            prev ? { ...prev, socials: { ...prev.socials, [social.key]: newVal } } : null
                          );
                        }}
                        value={myProfile.socials[social.key as keyof typeof myProfile.socials] || ""}
                        placeholder={`Your ${social.label} profile URL`}
                        className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Account Security */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Security</h2>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Shield className="w-4 h-4 text-orange-500" />
                    Password
                  </label>
                  <EditableField
                    onChange={(newVal) => {
                      setUnsaved(true);
                      setMyProfile((prev) => (prev ? { ...prev, password: newVal } : null));
                    }}
                    value={myProfile.password || ""}
                    placeholder="Update your password"
                    className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* My Interests */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">My Interests</h2>
                </div>
                <InterestBox role="mentor" />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MyProfile;