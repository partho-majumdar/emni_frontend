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

type Props = {
  student: boolean;
};

export default function LoginForm({ student }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    startTransition(async () => {
      setIsPending(true);
      if (student) {
        const res = await studentSignIn({ email, password });
        const student_id = res.sid;
        localStorage.setItem("student-id", student_id);
        if (res.error && res.error.length > 0) {
          setErrorText(res.error);
          setIsPending(false);
        } else {
          router.replace("/s/myprofile");
        }
      } else {
        const res = await mentorSignIn({ email, password });
        const mentor_id = res.mid;
        console.log("hello", res);
        localStorage.setItem("mentor-id", mentor_id);
        if (res.error && res.error.length > 0) {
          setErrorText(res.error);
          setIsPending(false);
        } else {
          router.replace("/m/myprofile");
        }
      }
    });
  };
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-4xl flex justify-center"></CardTitle>
          <CardDescription className="flex flex-col items-center justify-center text-lg">
            Sign in to your account
            <span className="text-red-400 bg-red-900/40 px-3 rounded-md text-sm ">
              {errorText}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={student ? "student@any.com" : "mentor@any.com"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  errorText.length > 0 && "text-red-400 bg-red-900/40",
                )}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  errorText.length > 0 && "text-red-400 bg-red-900/40",
                )}
              />
            </div>
            {isPending ? (
              <LoadingSpinner />
            ) : (
              <span
                className={cn(
                  theme_style,
                  "hover:opacity-70 cursor-pointer px-4 py-2 rounded-md text-center text-white ",
                  smooth_hover,
                )}
                onClick={handleSignIn}
              >
                Sign in
              </span>
            )}
          </div>
          {/* <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              href={student ? "/sign-up" : "/sign-up"}
              className="underline underline-offset-4"
            >
              Sign up
            </a>
            {isPending && <LoadingSpinner />}
          </div> */}

          <div className="text-sm text-muted-foreground text-center mt-3">
            Don't have an account?{" "}
            <Link 
              href="/sign-up"
              className="text-orange-500 hover:underline"
            >
              Sign-up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
