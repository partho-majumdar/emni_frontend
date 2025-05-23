"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  InterestType,
  MentorPersonalInfoType,
  StudentPersonalInfoType,
} from "@/app/types";
import { cn } from "@/lib/utils";
import AddInterestBtn from "./AddInterestBtn";
import { theme_border, theme_style } from "./CustomStyles";
import { useStudentData } from "../contexts/StudentDataContext";
import { apiRequest, ApiRequestType } from "../lib/apiClient";
import { useRouter } from "next/navigation";
import { getStudentPersonalInfo } from "@/app/lib/fetchers/student";
import { useMentorData } from "../contexts/MentorDataContext";
import { getMentorPersonalInfo } from "@/app/lib/fetchers/mentor";
import { jakarta } from "../utils/font";

type Props = {
  student: boolean;
  interests: InterestType[];
  query_id: string;
};

const getIdFromLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return storedData;
    }
    return null;
  }
  return null;
};

const Profile = (props: Props) => {
  const [sID, setSID] = React.useState<string | null>(null);
  const [mID, setMID] = React.useState<string | null>(null);
  const { studentData, updateStudentInterests, updateStudentInfo } =
    useStudentData();

  const { mentorData, updateMentorInterests, updateMentorInfo } =
    useMentorData();
  const router = useRouter();

  const studentInterests = studentData?.interests;
  const mentorInterests = mentorData?.interests;
  const studentPersonalInfo: StudentPersonalInfoType | undefined =
    studentData?.personalInfo;
  const mentorPersonalInfo: MentorPersonalInfoType | undefined =
    mentorData?.personalInfo;
  let avatarLink = `https://robohash.org/${
    props.student ? studentPersonalInfo?.name : mentorPersonalInfo?.name
  }.png?size=200x200`;
  if (!props.student && mentorPersonalInfo?.profile_pic) {
    avatarLink = mentorPersonalInfo.profile_pic;
  }

  let isOwnProfile = false;
  if (props.student) {
    isOwnProfile = sID === props.query_id;
  } else {
    isOwnProfile = mID === props.query_id;
  }

  console.log(mentorData, updateMentorInfo, mID);

  React.useEffect(() => {
    if (props.student) {
      const student_id = getIdFromLocalStorage("student-id");
      if (!student_id) {
        router.replace("/sign-in");
      }
      console.log("student id ", student_id);
      setSID(student_id);
      updateStudentInterests(props.interests);
    } else {
      const mentor_id = getIdFromLocalStorage("mentor-id");
      if (!mentor_id) {
        router.replace("/sign-in");
      }
      console.log("Profile.tsx => mentor id ", mentor_id);
      setMID(mentor_id);
      updateMentorInterests(props.interests);
    }
  }, []);

  React.useEffect(() => {
    const fn = async () => {
      if (sID) {
        const sInfo = await getStudentPersonalInfo(sID);
        updateStudentInfo(sInfo);
      }
    };
    fn();
  }, [sID]);

  React.useEffect(() => {
    const fn = async () => {
      if (mID) {
        const mInfo = await getMentorPersonalInfo(mID);
        updateMentorInfo(mInfo);
      }
    };
    fn();
  }, [mID]);

  React.useEffect(() => {
    const i_array: string[] = studentData
      ? (studentData.interests ?? []).map((i) => i.interest_id)
      : [];
    const payload = {
      interestIds: i_array,
    };
    if (payload) {
      const fn = async () => {
        const req: ApiRequestType = {
          endpoint: "api/student/interests/update",
          method: "PUT",
          body: payload,
          auth: true,
        };
        const res = await apiRequest(req);
        console.log(res);
      };
      fn();
    }
  }, [studentData?.interests]);

  React.useEffect(() => {
    const i_array: string[] = mentorData
      ? (mentorData.interests ?? []).map((i) => i.interest_id)
      : [];
    const payload = {
      interestIds: i_array,
    };

    if (payload) {
      const fn = async () => {
        const req: ApiRequestType = {
          endpoint: "api/mentor/interests/update",
          method: "PUT",
          body: payload,
          auth: true,
        };
        const res = await apiRequest(req);
        console.log(res);
      };
      fn();
    }
  }, [mentorData?.interests]);

  return (
    <div className="flex flex-col gap-y-4 p-5 ">
      <div className="flex justify-between">
        <div className="flex flex-col  items-center  m-4">
          <div>
            <Image
              src={avatarLink}
              alt="avatar"
              width={200}
              height={200}
              className="border rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex justify-end text-lg">
              <span className=" bg-orange-500/30 px-2 rounded-xl flex justify-center items-center">
                {props.student ? "Student" : "Mentor"}
              </span>
            </div>
            <div className={`text-6xl ${jakarta.className} font-black`}>
              {props.student
                ? studentPersonalInfo?.name
                : mentorPersonalInfo?.name}
            </div>
            <div className="flex gap-x-4 text-xl text-muted-foreground justify-end">
              <div>
                @
                {props.student
                  ? studentPersonalInfo?.username
                  : mentorPersonalInfo?.username}
              </div>
              <div>
                {props.student
                  ? studentPersonalInfo?.email
                  : mentorPersonalInfo?.email}
              </div>
            </div>
            <div className="flex justify-end my-3">
              <Button
                size={"custom"}
                variant={"outline"}
                className="cursor-pointer"
              >
                Message
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col  font-semibold">
          <div className="flex justify-end gap-x-3 my-4 text-2xl w-full">
            <span
              className={cn(
                theme_style,
                " flex justify-center w-48 rounded-xl px-2"
              )}
            >
              Interested At
            </span>
            {isOwnProfile && (
              <AddInterestBtn
                student={true}
                setStudentInterests={(newInterests: InterestType[]) => {
                  updateStudentInterests(newInterests);
                }}
                SelectCount={5}
              />
            )}
          </div>
          {props.student && (
            <div className="flex gap-x-4 font-normal flex-wrap gap-y-4 ">
              {studentInterests && (studentInterests ?? []).length > 0 ? (
                (studentInterests ?? []).map((interest) => (
                  <span
                    key={interest.interest_id}
                    className={cn(
                      theme_border,
                      "flex justify-center rounded-full px-4 "
                    )}
                  >
                    {interest.interest_name}
                  </span>
                ))
              ) : (
                <span className=" text-lg font-normal text-muted-foreground">
                  Click the Add Button to add interests
                </span>
              )}
            </div>
          )}

          {!props.student && (
            <div className="flex gap-x-4 font-normal flex-wrap gap-y-4 ">
              {mentorInterests && (mentorInterests ?? []).length > 0 ? (
                (mentorInterests ?? []).map((interest) => (
                  <span
                    key={interest.interest_id}
                    className={cn(
                      theme_border,
                      "flex justify-center rounded-full px-4 "
                    )}
                  >
                    {interest.interest_name}
                  </span>
                ))
              ) : (
                <span className=" text-lg font-normal text-muted-foreground">
                  Click the Add Button to add interests
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
