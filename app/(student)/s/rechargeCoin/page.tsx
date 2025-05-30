"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  Coins,
  Phone,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Zap,
  ChevronRight,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMyProfileDetailsStudent, getUcoinBalance } from "@/app/lib/fetchers/student";
import { apiRequest } from "@/app/lib/apiClient";
import { StudentInfoType } from "@/app/types";
import Link  from "next/link";

interface PurchaseFormData {
  tk_amount: string;
  payment_method: string;
  transaction_reference: string;
  phone_number: string;
  address: string;
}

interface RechargeRequestData {
  tk_amount: number;
  payment_method: string;
  transaction_reference: string;
  phone_number: string;
  address: string;
}

const RechargeUcoinPage = () => {
  const router = useRouter();
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PurchaseFormData>({
    tk_amount: "",
    payment_method: "",
    transaction_reference: "",
    phone_number: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<StudentInfoType | null>(null);
  const [error, setError] = useState<string>("");

  // Fetch balance and user info from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        const [balance, profile] = await Promise.all([
          getUcoinBalance(),
          getMyProfileDetailsStudent(),
        ]);

        setCoinBalance(balance);
        setUserInfo(profile);
        setError("");
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load profile data. Please refresh the page.");
        toast.error("Failed to load profile data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // Polling for balance updates
  useEffect(() => {
    if (!userInfo) return;

    const intervalId = setInterval(async () => {
      try {
        const balance = await getUcoinBalance();
        setCoinBalance(balance);
      } catch (err) {
        console.error("Failed to update balance:", err);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, payment_method: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!userInfo) {
        toast.error("User information not available");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.tk_amount || !formData.payment_method || !formData.phone_number) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (Number(formData.tk_amount) < 10) {
        toast.error("Minimum recharge amount is ৳10");
        return;
      }
      if (!/^01[3-9]\d{8}$/.test(formData.phone_number)) {
        toast.error("Please enter a valid Bangladeshi phone number");
        return;
      }
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

  const handleSubmit = async () => {
    if (!formData.transaction_reference.trim()) {
      toast.error("Transaction reference is required");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }

    setIsLoading(true);

    try {
      const rechargeData: RechargeRequestData = {
        tk_amount: Number(formData.tk_amount),
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference.trim(),
        phone_number: formData.phone_number.trim(),
        address: formData.address.trim(),
      };

      // Make API call to submit recharge request
      const response = await apiRequest({
        endpoint: "api/sessions/purchase-ucoin",
        method: "POST",
        body: rechargeData,
      });

      if (response.success) {
        // Update balance from response or fetch fresh balance
        const newBalance = await getUcoinBalance();
        setCoinBalance(newBalance);

        toast.success("Recharge request submitted successfully! Your UCOIN will be added after verification.");

        // Reset form
        setFormData({
          tk_amount: "",
          payment_method: "",
          transaction_reference: "",
          phone_number: "",
          address: "",
        });
        setCurrentStep(1);
        setIsDialogOpen(false);
      } else {
        throw new Error(response.message || "Failed to submit recharge request");
      }
    } catch (error: any) {
      console.error("Recharge submission failed:", error);
      toast.error(error?.message || "Failed to submit recharge request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ucoinAmount = formData.tk_amount ? (Number(formData.tk_amount) / 10).toFixed(1) : "0";
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 px-6 pb-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">User Information</h3>
              <p className="text-gray-400 text-sm">Confirm your details before proceeding</p>
            </div>

            {userInfo && (
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{userInfo.name}</p>
                    <p className="text-gray-400 text-sm">@{userInfo.username}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{userInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="text-orange-400 font-medium">{coinBalance} UCOIN</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300"
            >
              Continue to Recharge
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 2:
        return (
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4 px-6 pb-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Recharge Details</h3>
                <p className="text-gray-400 text-sm">Select amount and payment method</p>
              </div>

              {/* Quick Amount Selection */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Quick Select Amount</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, tk_amount: amount.toString() }))}
                      className={`p-2 text-sm rounded-lg border transition-all duration-300 ${
                        formData.tk_amount === amount.toString()
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 scale-105"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-orange-500/30 hover:bg-gray-700/50"
                      }`}
                    >
                      ৳{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Custom Amount <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  name="tk_amount"
                  value={formData.tk_amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount (minimum ৳10)"
                  min="10"
                  step="10"
                  className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-lg px-3 py-2 text-white transition-all duration-300"
                />
                {formData.tk_amount && (
                  <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-sm text-orange-300">
                      You will receive: <span className="font-semibold text-orange-400">{ucoinAmount} UCOIN</span>
                      <br />
                      <span className="text-xs text-gray-400">Exchange rate: ৳10 = 1 UCOIN</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Payment Method <span className="text-red-400">*</span>
                </label>
                <Select value={formData.payment_method} onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-lg px-3 py-2 text-white h-10 transition-all duration-300">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white rounded-lg">
                    <SelectItem value="Bkash" className="hover:bg-orange-500/20 focus:bg-orange-500/20">
                      bKash
                    </SelectItem>
                    <SelectItem value="Nagad" className="hover:bg-orange-500/20 focus:bg-orange-500/20">
                      Nagad
                    </SelectItem>
                    <SelectItem value="Rocket" className="hover:bg-orange-500/20 focus:bg-orange-500/20">
                      Rocket
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                  <Input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-lg pl-9 py-2 text-white transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter the phone number used for payment</p>
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
                    disabled={!formData.tk_amount || !formData.payment_method || !formData.phone_number}
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
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4 px-6 pb-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Confirm Purchase</h3>
                <p className="text-gray-400 text-sm">Review and complete your transaction</p>
              </div>

              {/* Important Instructions */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-300 font-medium mb-1">Important Instructions:</p>
                    <ul className="text-amber-200 space-y-0.5 text-xs">
                      <li>• Complete payment using your selected method</li>
                      <li>• Copy the transaction ID after payment</li>
                      <li>• UCOIN will be added after verification (usually within 24 hours)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Transaction Reference */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Transaction Reference <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  name="transaction_reference"
                  value={formData.transaction_reference}
                  onChange={handleInputChange}
                  placeholder="Enter transaction ID from payment"
                  className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-lg px-3 py-2 text-white transition-all duration-300"
                />
                <p className="text-xs text-gray-400 mt-1">This is required for verification</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-orange-500" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your complete address"
                    rows={3}
                    className="w-full bg-gray-800/50 border border-gray-700/50 focus:border-orange-500 rounded-lg pl-9 py-2 text-white resize-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  Transaction Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-medium">৳{formData.tk_amount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">UCOIN to receive:</span>
                    <span className="text-orange-400 font-medium">{ucoinAmount} UCOIN</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-white">{formData.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Phone Number:</span>
                    <span className="text-white">{formData.phone_number}</span>
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
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.transaction_reference.trim() || !formData.address.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Submit Request
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 backdrop-blur-sm">
          <Link href = "/s/myprofile">
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>

          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-semibold text-white">UCOIN Recharge</h1>
          </div>

          <div className="w-16"></div>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-md">
              {/* Balance Card */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-400">Current Balance</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{coinBalance.toLocaleString()}</div>
                <div className="text-sm text-orange-300">UCOIN</div>
              </div>

              {/* Recharge Button */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <CreditCard className="w-5 h-5" />
                  Recharge UCOIN
                </Button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure payment with instant verification
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
              Recharge UCOIN
            </DialogTitle>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step <= currentStep ? "bg-orange-500 text-white shadow-lg" : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                        step < currentStep ? "bg-orange-500" : "bg-gray-700"
                      }`}
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

export default RechargeUcoinPage;