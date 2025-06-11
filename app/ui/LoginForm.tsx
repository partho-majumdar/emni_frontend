"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mentorSignIn, studentSignIn } from "@/app/(auth)/authActions";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingComponent";
import { smooth_hover, theme_style } from "./CustomStyles";
import Link from "next/link";
import { toast } from "sonner";

type Props = {
  student: boolean;
};

export default function LoginForm({ student }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check if Sign-in button should be enabled
  const isSignInDisabled = !email.trim() || !password.trim();

  const handleSignIn = () => {
    // Validate required fields
    const missingFields: string[] = [];
    if (!email.trim()) missingFields.push("Email");
    if (!password.trim()) missingFields.push("Password");

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    startTransition(async () => {
      setIsPending(true);
      if (student) {
        const res = await studentSignIn({ email, password });
        const student_id = res.sid;
        localStorage.setItem("student-id", student_id);
        if (res.error && res.error.length > 0) {
          toast.error(res.error);
          setIsPending(false);
        } else {
          router.replace("/s/myprofile");
        }
      } else {
        const res = await mentorSignIn({ email, password });
        const mentor_id = res.mid;
        localStorage.setItem("mentor-id", mentor_id);
        if (res.error && res.error.length > 0) {
          toast.error(res.error);
          setIsPending(false);
        } else {
          router.replace("/m/myprofile");
        }
      }
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-2xl flex justify-center"></CardTitle>
          <CardDescription className="flex flex-col items-center justify-center text-base">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={student ? "student@any.com" : "mentor@any.com"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm h-9"
              />
            </div>
            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm h-9 pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>
            {isPending ? (
              <LoadingSpinner />
            ) : (
              <span
                className={cn(
                  theme_style,
                  "cursor-pointer px-3 py-1.5 rounded-md text-center text-sm",
                  isSignInDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md transition-transform duration-200",
                )}
                onClick={isSignInDisabled ? undefined : handleSignIn}
              >
                Sign in
              </span>
            )}
          </div>

          <div className="text-sm text-muted-foreground text-center mt-2">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-orange-500 hover:underline">
              Sign-up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// "use client";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { mentorSignIn, studentSignIn } from "@/app/(auth)/authActions";
// import { startTransition, useState } from "react";
// import { useRouter } from "next/navigation";
// import LoadingSpinner from "./LoadingComponent";
// import { smooth_hover, theme_style } from "./CustomStyles";
// import Link from "next/link";
// import { toast } from "sonner"; 

// type Props = {
//   student: boolean;
// };

// export default function LoginForm({ student }: Props) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isPending, setIsPending] = useState(false);
//   const router = useRouter();

//   const handleSignIn = () => {
//     // Validate required fields
//     const missingFields: string[] = [];
//     if (!email.trim()) missingFields.push("Email");
//     if (!password.trim()) missingFields.push("Password");

//     if (missingFields.length > 0) {
//       toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
//       return;
//     }

//     startTransition(async () => {
//       setIsPending(true);
//       if (student) {
//         const res = await studentSignIn({ email, password });
//         const student_id = res.sid;
//         localStorage.setItem("student-id", student_id);
//         if (res.error && res.error.length > 0) {
//           toast.error(res.error);
//           setIsPending(false);
//         } else {
//           router.replace("/s/myprofile");
//         }
//       } else {
//         const res = await mentorSignIn({ email, password });
//         const mentor_id = res.mid;
//         localStorage.setItem("mentor-id", mentor_id);
//         if (res.error && res.error.length > 0) {
//           toast.error(res.error);
//           setIsPending(false);
//         } else {
//           router.replace("/m/myprofile");
//         }
//       }
//     });
//   };

//   return (
//     <div className={cn("flex flex-col gap-4")}>
//       <Card className="border-none">
//         <CardHeader>
//           <CardTitle className="text-2xl flex justify-center"></CardTitle>
//           <CardDescription className="flex flex-col items-center justify-center text-base">
//             Sign in to your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col gap-4">
//             <div className="grid gap-1">
//               <Label htmlFor="email" className="text-sm">
//                 Email
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder={student ? "student@any.com" : "mentor@any.com"}
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="text-sm h-9"
//               />
//             </div>
//             <div className="grid gap-1">
//               <div className="flex items-center">
//                 <Label htmlFor="password" className="text-sm">
//                   Password
//                 </Label>
//               </div>
//               <Input
//                 id="password"
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="text-sm h-9"
//               />
//             </div>
//             {isPending ? (
//               <LoadingSpinner />
//             ) : (
//               <span
//                 className={cn(
//                   theme_style,
//                   "hover:opacity-70 cursor-pointer px-3 py-1.5 rounded-md text-center text-sm",
//                   smooth_hover,
//                 )}
//                 onClick={handleSignIn}
//               >
//                 Sign in
//               </span>
//             )}
//           </div>

//           <div className="text-sm text-muted-foreground text-center mt-2">
//             Don't have an account?{" "}
//             <Link href="/sign-up" className="text-orange-500 hover:underline">
//               Sign-up
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
