"use client";
import { getMyProfileDetailsStudent, getUcoinBalance } from "@/app/lib/fetchers/student";
import { updateStudentProfile } from "@/app/lib/mutations/student";
import { StudentInfoType } from "@/app/types";
import { hover_style, smooth_hover, theme_style } from "@/app/ui/CustomStyles";
import EditableField from "@/app/ui/EditableField";
import ImageUploader from "@/app/ui/ImageUploader";
import InterestBox from "@/app/ui/InterestBoxUI/InterestBox";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Coins, User, Mail, GraduationCap, Lock, Edit3, Camera, Sparkles, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";

const MyProfile = () => {
  const [myProfile, setMyProfile] = useState<StudentInfoType | null>(null);
  const [unsaved, setUnsaved] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [coinBalance, setCoinBalance] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchProfileAndBalance = async () => {
      try {
        const profile: StudentInfoType = await getMyProfileDetailsStudent();
        setMyProfile(profile);
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
        await updateStudentProfile(myProfile, null);
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
        const updatedProfile = await updateStudentProfile(myProfile, image);
        setMyProfile(updatedProfile);
        setImage(null);
        setImageError(false);
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
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Floating Save Button */}
      {unsaved && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right-5">
          <button
            onClick={handleSave}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-orange-400/20 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/25"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Save Changes</span>
            </div>
          </button>
        </div>
      )}

      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section with Coin Balance */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-900/70 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500/80 shadow-2xl">
                    {imageError ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    ) : (
                      <Image
                        src={myProfile.image_link || "/images/placeholder.png"}
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
                      <button className="absolute -bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group-hover:shadow-orange-500/50">
                        <Camera className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 backdrop-blur-xl text-white border border-orange-500/30 rounded-2xl max-w-md">
                      <DialogTitle className="text-xl text-orange-500 font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Update Profile Picture
                      </DialogTitle>
                      <div className="flex flex-col items-center gap-6 py-4">
                        <ImageUploader
                          source={myProfile.image_link || "/images/placeholder.png"}
                          setImage={(img) => setImage(img)}
                          image={image}
                        />
                        <DialogClose
                          onClick={updateProfilePicture}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-8 rounded-xl font-medium w-full transition-all duration-300 hover:scale-105"
                        >
                          Update Picture
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
                      {myProfile.name}
                    </h1>
                    <p className="text-xl text-gray-300 mb-1">@{myProfile.username}</p>
                    <p className="text-lg text-gray-400 flex items-center justify-center lg:justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      {myProfile.email}
                    </p>
                  </div>
                  <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
                    {myProfile.bio || "No bio yet. Add something interesting about yourself..."}
                  </p>
                </div>

                {/* Coin Balance Card */}
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
            {/* Left Column - Personal Details */}
            <div className="xl:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-500/20">
                    <User className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-semibold text-orange-500">Personal Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Username</label>
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white group-hover:border-orange-500/30 transition-colors">
                          {myProfile.username || "No username set"}
                        </div>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Full Name</label>
                        <EditableField
                          onChange={(newVal) => {
                            setUnsaved(true);
                            setMyProfile((prev) => (prev ? { ...prev, name: newVal } : null));
                          }}
                          value={myProfile.name || ""}
                          placeholder="Enter your full name"
                          className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white transition-all duration-300 hover:border-orange-500/30"
                        />
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Gender</label>
                        <Select
                          value={myProfile?.gender || undefined}
                          onValueChange={(val) => {
                            setUnsaved(true);
                            setMyProfile(prev => prev ? { ...prev, gender: val as "Male" | "Female" } : null);
                          }}
                        >
                          <SelectTrigger className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white h-12 transition-all duration-300 hover:border-orange-500/30">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border border-orange-500/30 text-white rounded-xl">
                            <SelectItem value="Male" className="hover:bg-orange-500/20 focus:bg-orange-500/20 rounded-lg">
                              Male
                            </SelectItem>
                            <SelectItem value="Female" className="hover:bg-orange-500/20 focus:bg-orange-500/20 rounded-lg">
                              Female
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Email Address</label>
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white group-hover:border-orange-500/30 transition-colors">
                          {myProfile.email || "No email set"}
                        </div>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Date of Birth</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal h-12 transition-all duration-300",
                                !myProfile.dob && "text-gray-400",
                                "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-orange-500/30 text-white rounded-xl"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-4 w-4 text-orange-500" />
                              {myProfile.dob ? format(myProfile.dob, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-900/95 backdrop-blur-xl border border-orange-500/30 rounded-xl">
                            {!selectedYear ? (
                              <div className="p-4">
                                <h3 className="text-lg font-medium text-orange-500 mb-4">Select Year</h3>
                                <ScrollArea className="h-[300px]">
                                  <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                                      const year = 1900 + i;
                                      return (
                                        <Button
                                          key={year}
                                          variant={"ghost"}
                                          className="hover:bg-orange-500/20 rounded-lg transition-colors"
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
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedYear(null)}
                                    className="text-orange-500 hover:bg-orange-500/20"
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
                                        className="hover:bg-orange-500/20 rounded-lg"
                                        onClick={() => setSelectedMonth(month)}
                                      >
                                        {format(new Date(selectedYear, month - 1, 1), "MMM")}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedMonth(null)}
                                    className="text-orange-500 hover:bg-orange-500/20"
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
                                  selected={myProfile.dob || undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setUnsaved(true);
                                      setMyProfile((prev) => (prev ? { ...prev, dob: date } : null));
                                    }
                                  }}
                                  className="p-4"
                                />
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Graduation Year</label>
                        <Select
                          value={myProfile?.grad_year?.toString() || undefined}
                          onValueChange={(val) => {
                            setUnsaved(true);
                            setMyProfile(prev => prev ? { ...prev, grad_year: parseInt(val) } : null);
                          }}
                        >
                          <SelectTrigger className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white h-12 transition-all duration-300 hover:border-orange-500/30">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border border-orange-500/30 text-white rounded-xl max-h-[300px]">
                            {Array.from({ length: 2050 - 2000 + 1 }, (_, i) => {
                              const year = 2000 + i;
                              return (
                                <SelectItem 
                                  key={year} 
                                  value={year.toString()}
                                  className="hover:bg-orange-500/20 focus:bg-orange-500/20 rounded-lg"
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
              </div>

              {/* About Me Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-500/20">
                    <Edit3 className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-semibold text-orange-500">About Me</h2>
                  </div>
                  <EditableField
                    onChange={(newVal) => {
                      setUnsaved(true);
                      setMyProfile((prev) => (prev ? { ...prev, bio: newVal } : null));
                    }}
                    value={myProfile.bio || ""}
                    placeholder="Tell us about yourself, your interests, goals, and what makes you unique..."
                    className="w-full min-h-[150px] bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-4 text-white transition-all duration-300 hover:border-orange-500/30 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Security & Interests */}
            <div className="space-y-8">
              {/* Account Security Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-500/20">
                    <Lock className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-orange-500">Security</h2>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">Password</label>
                    <EditableField
                      onChange={(newVal) => {
                        setUnsaved(true);
                        setMyProfile((prev) => (prev ? { ...prev, password: newVal } : null));
                      }}
                      value={myProfile.password || ""}
                      placeholder="Update your password"
                      className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white transition-all duration-300 hover:border-orange-500/30"
                      type="password"
                    />
                  </div>
                </div>
              </div>

              {/* Interests Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-500/20">
                    <GraduationCap className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-orange-500">My Interests</h2>
                  </div>
                  <InterestBox role="student" />
                </div>
              </div>

              {/* Recharge UCOIN Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-500/20">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-orange-500">UCOIN Wallet</h2>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Coins className="w-6 h-6 text-orange-400" />
                        <span className="text-sm text-gray-300 font-medium">Current Balance</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-400 mb-1">{coinBalance}</div>
                      <div className="text-sm text-orange-300 font-medium">UCOIN</div>
                    </div>
                    <Link href={`/s/rechargeCoin/`}>
                      <button
                        className="group w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Recharge UCOIN</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    {/* <button
                      className="group w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Recharge UCOIN</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button> */}
                    <p className="text-xs text-gray-400 mt-3">
                      Add more UCOIN to your wallet for premium features
                    </p>
                  </div>
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