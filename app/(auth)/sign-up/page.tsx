import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupStudent from "./ui/SignupStudent";
import { cn } from "@/lib/utils";
import { gradientText1 } from "@/app/ui/CustomStyles";
import SignupMentor from "./ui/SignupMentor";

const page = () => {
  return (
    <div className="flex min-h-svh justify-center  p-6 md:p-10">
      <Tabs defaultValue="student" className="w-fit">
        <TabsList className="w-[800px]   ">
          <TabsTrigger className="text-xl" value="student">
            Student
          </TabsTrigger>
          <TabsTrigger className="text-xl" value="mentor">
            Mentor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="student" className=" py-10">
          <span
            className={cn(
              "text-4xl font-semibold bg-orange-800/20 px-2 text-orange-500 rounded-md",
              gradientText1
            )}
          >
            Create Student Account
          </span>
          <SignupStudent />
        </TabsContent>
        <TabsContent value="mentor" className="py-10">
          <span
            className={cn(
              "text-4xl font-semibold bg-orange-800/20 px-2 text-orange-500 rounded-md",
              gradientText1
            )}
          >
            Create Mentor Account
          </span>

          <SignupMentor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default page;
