"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { gradientText1 } from "@/app/ui/CustomStyles";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { getSessionAndAvailabilityByIds } from "@/app/lib/fetchers/mentor";
import { getUcoinBalance } from "@/app/lib/fetchers/student";
import { bookSession } from "@/app/lib/mutations/student";
import { AvalabilityType, SessionInfoType } from "@/app/types";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const StudentPayment = () => {
  const searchParams = useSearchParams();
  const sessionID = searchParams.get("s");
  const availabilityID = searchParams.get("a");
  const price = searchParams.get("p");
  const router = useRouter();

  const [sessionInfo, setSessionInfo] = useState<SessionInfoType | null>(null);
  const [fslot, setFslot] = useState<AvalabilityType | null>(null);
  const [selectedMedium, setSelectedMedium] = useState("");
  const [ucoinBalance, setUcoinBalance] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Function to fetch balance with proper error handling
  const fetchBalance = async () => {
    try {
      setIsBalanceLoading(true);
      const balance = await getUcoinBalance();
      console.log("Fetched balance:", balance, typeof balance);
      
      // Handle different possible return types
      if (typeof balance === 'number' && !isNaN(balance)) {
        setUcoinBalance(balance);
      } else if (typeof balance === 'string' && !isNaN(parseFloat(balance))) {
        setUcoinBalance(parseFloat(balance));
      } else if (balance && typeof balance === 'object' && 'balance' in balance) {
        // In case the API returns an object with balance property
        const balanceValue = (balance as any).balance;
        if (typeof balanceValue === 'number' && !isNaN(balanceValue)) {
          setUcoinBalance(balanceValue);
        } else {
          setUcoinBalance(0);
        }
      } else {
        console.warn("Invalid balance format received:", balance);
        setUcoinBalance(0);
      }
    } catch (err) {
      console.error("Balance fetch failed:", err);
      // Don't show error toast for balance fetch failures, just set to 0
      setUcoinBalance(0);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        if (!sessionID || !availabilityID) {
          throw new Error("Session ID or Availability ID not found in URL");
        }

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
          throw new Error("Invalid session price");
        }

        // Fetch session data and balance in parallel
        const [data] = await Promise.all([
          getSessionAndAvailabilityByIds(sessionID, availabilityID),
          fetchBalance(), // Use our custom balance fetch function
        ]);

        if (!data.session || !data.freeslot) {
          throw new Error("Failed to load session or slot data");
        }

        setSessionInfo(data.session);
        setFslot(data.freeslot);
        setSelectedMedium(data.freeslot.medium[0] || "");
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to load session data");
        toast.error(err.message || "Failed to load session data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [sessionID, availabilityID, price]);

  // Balance polling - refresh balance every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBalance();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Manual balance refresh
  const handleRefreshBalance = () => {
    fetchBalance();
  };

  const handleNext = () => {
    if (currentStep === 2 && !selectedMedium) {
      toast.error("Please select a session medium");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookSession = () => {
    if (!sessionInfo || !fslot) {
      toast.error("Session or slot information missing");
      return;
    }

    if (ucoinBalance < Number(price)) {
      toast.error("You do not have enough UCOIN. Please recharge first.");
      router.push("/s/rechargeCoin");
      return;
    }

    setIsDialogOpen(true);
  };

  const confirmPayment = async () => {
    if (!sessionID || !availabilityID || !selectedMedium) {
      toast.error("Missing required booking information");
      setIsDialogOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const success = await bookSession(sessionID, availabilityID, selectedMedium);
      if (success) {
        toast.success("Successfully booked a session, Best of Luck 🥳");
        router.replace("/s/schedule");
      } else {
        throw new Error("Failed to book the session");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error("Failed to book the session. Please try again. 🥲");
      router.replace("/s/sessions");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setCurrentStep(1);
    }
  };

  // Safe balance formatting function
  const formatBalance = (balance: number | undefined | null): string => {
    if (typeof balance !== 'number' || isNaN(balance)) {
      return "0.00";
    }
    return balance.toFixed(2);
  };

  const handleRetry = () => {
    setIsPageLoading(true);
    setError("");
    router.refresh();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 px-6 pb-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Session Details</h3>
              <p className="text-gray-400 text-sm">Review the session information</p>
            </div>

            {sessionInfo && fslot && (
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session:</span>
                    <span className="text-white">{sessionInfo.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mentor:</span>
                    <span className="text-white">{sessionInfo.mentorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{format(fslot.start, "PPPP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">
                      {format(fslot.start, "p")} - {format(fslot.end, "p")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-orange-400 font-medium">{Number(price).toFixed(2)} UCOIN</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 2:
        return (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4 px-6 pb-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Select Medium</h3>
                <p className="text-gray-400 text-sm">Choose how you want to attend the session</p>
              </div>

              <div className="space-y-3">
                {fslot?.medium?.length ? (
                  fslot.medium.map((m) => (
                    <div
                      key={m}
                      className={cn(
                        "px-4 py-3 rounded-lg border cursor-pointer transition-all duration-300",
                        selectedMedium === m
                          ? "bg-orange-500/20 border-orange-500 text-orange-400"
                          : "bg-gray-800/30 border-gray-700/30 text-gray-300 hover:border-orange-500/30 hover:bg-gray-700/50"
                      )}
                      onClick={() => setSelectedMedium(m)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedMedium === m} />
                        <span className="capitalize">{m}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center">No medium available</p>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-900/95 px-4 py-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 rounded-lg py-2.5 transition-all duration-300"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedMedium}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      case 3:
        return (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4 px-6 pb-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Confirm Booking</h3>
                <p className="text-gray-400 text-sm">Review and confirm your payment</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-300 font-medium mb-1">Note:</p>
                    <p className="text-amber-200">
                      By confirming, {Number(price).toFixed(2)} UCOIN will be deducted from your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  Booking Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Session:</span>
                    <span className="text-white">{sessionInfo?.title || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Mentor:</span>
                    <span className="text-white">{sessionInfo?.mentorName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="text-white">
                      {fslot
                        ? `${format(fslot.start, "PPP p")} - ${format(fslot.end, "p")}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Medium:</span>
                    <span className="text-white capitalize">{selectedMedium || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Your Balance:</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          ucoinBalance >= Number(price)
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {formatBalance(ucoinBalance)} UCOIN
                      </span>
                      <Button
                        onClick={handleRefreshBalance}
                        disabled={isBalanceLoading}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <RefreshCw className={cn("w-3 h-3", isBalanceLoading && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-orange-400 font-medium">
                      {Number(price).toFixed(2)} UCOIN
                    </span>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-900/95 px-4 py-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 rounded-lg py-2.5 transition-all duration-300"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={confirmPayment}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      default:
        return null;
    }
  };

  // Handle loading state
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">{error}</p>
          <Button
            onClick={handleRetry}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl"
          >
            Retry
          </Button>
          <Button
            onClick={() => router.replace("/s/sessions")}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl"
          >
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 backdrop-blur-sm">
          <Link href="/s/sessions">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h1 className={`text-lg font-semibold ${gradientText1}`}>Book Session</h1>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-md">
              {/* Session Summary Card */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-400">Session Summary</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{Number(price).toFixed(2)}</div>
                <div className="text-sm text-orange-300">UCOIN</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session:</span>
                    <span className="text-white">{sessionInfo?.title || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{fslot ? format(fslot.start, "PPPP") : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance:</span>
                    <div className="flex items-center gap-2">
                      <span className={ucoinBalance >= Number(price) ? "text-green-400" : "text-red-400"}>
                        {formatBalance(ucoinBalance)} UCOIN
                      </span>
                      <Button
                        onClick={handleRefreshBalance}
                        disabled={isBalanceLoading}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <RefreshCw className={cn("w-3 h-3", isBalanceLoading && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                <Button
                  onClick={handleBookSession}
                  disabled={isLoading || !sessionInfo || !fslot}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  Book Session
                </Button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure booking with instant confirmation
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Multi-step Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl text-white border border-gray-700/50 rounded-2xl max-w-md mx-4 max-h-[90vh] overflow-hidden p-0">
          <div className="p-6">
            <DialogTitle className="text-xl text-white font-bold flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <CreditCard className="w-5 h-5 text-orange-400" />
              </div>
              Book Session
            </DialogTitle>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      step <= currentStep ? "bg-orange-500 text-white shadow-lg" : "bg-gray-700 text-gray-400"
                    )}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 mx-2 transition-all duration-300",
                        step < currentStep ? "bg-orange-500" : "bg-gray-700"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderStepContent()}

          <div className="p-6 pt-0">
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Secure payment with 256-bit encryption
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPayment;
