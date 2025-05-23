"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className=" flex flex-col items-center justify-center select-none">
      <span
        onClick={() => {
          router.push("/sign-in");
        }}
      >
        sign in
      </span>
      <span
        onClick={() => {
          router.push("/sign-up");
        }}
      >
        sign up
      </span>
    </div>
  );
}
