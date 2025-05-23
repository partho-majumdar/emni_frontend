import { StudentInfoSchema } from "@/app/(student)/schemas";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import {
  AvalabilityType,
  InterestType,
  MentorSuggestionType,
  StudentInfoType,
} from "@/app/types";
import { getAvatar } from "@/app/utils/utility";

export async function getStudentPersonalInfo(sID: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/${sID}`,
    method: "GET",
    auth: true,
  };
  const res1 = await apiRequest(req);
  if (res1.success === false) {
    throw new Error("Failed to fetch student info");
  }
  const res = res1.data;
  const studentPersonalInfo = StudentInfoSchema.parse(res);
  console.log("student info ", studentPersonalInfo);

  return studentPersonalInfo;
}

export async function getMentorAvailableSlots(mID: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/mavaliableat/${mID}`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);
  console.log("mentor available slots", res);
  const data: AvalabilityType[] = res.map((slot: any) => {
    return {
      ...slot,
      start: new Date(slot.start),
      end: new Date(slot.end),
    };
  });
  return data.filter((slot) => slot.booked.length === 0);
}

export async function getMentorAvailabliltyById(aId: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/mavaliableat/aid/${aId}`, // requires refactoring
    method: "GET",
    auth: true, // student auth
  };
  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to fetch mentor availability");
  }
  return res.data;
}

export async function getMentorBasedOnInterest() {
  const req: ApiRequestType = {
    endpoint: `api/student/findmentor/interest`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to fetch mentor availability");
  }
  console.log("mentor suggestiong", res.data);
  const data = res.data.map((mentor: MentorSuggestionType) => {
    if (mentor.profile_pic && mentor.profile_pic.length > 0) {
      return mentor;
    }
    const refinedMentor = {
      ...mentor,
      profile_pic: getAvatar(mentor.mentorId),
    };
    return refinedMentor;
  });
  return data;
}

export async function getMentorBasedOnLevel() {
  const req: ApiRequestType = {
    endpoint: `api/student/findmentor/level`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to fetch mentor availability");
  }
  return res.data;
}

export async function getStudentBookedSessions(sID: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/booked/${sID}`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  console.log(res);
  if (!res.success) {
    throw new Error("Error fetching Booked Sessions");
  }
  console.log("booked sessions by student ", res.data);
  return res.data;
}

export async function getMyProfileDetailsStudent() {
  const req: ApiRequestType = {
    endpoint: `api/student/myself`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Error fetching my (student) details");
  }
  console.log("student ", res.data);
  const refined: StudentInfoType = { ...res.data };
  refined.dob = new Date(res.data.dob);
  refined.image_link =
    res.data.image_link.length > 0
      ? res.data.image_link
      : getAvatar(res.data.username);

  console.log("my profile details came from server ", refined);
  return refined;
}

export async function getInterestsListStudent() {
  const req: ApiRequestType = {
    endpoint: `api/student/interests/list`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Error fetching interests list");
  }
  return res.data as InterestType[];
}

export async function getNextBookedStudent(t: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/booked/closest?t=${t}`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to fetch next booked session");
  }
  const refined = { ...res.data };
  refined.StartTime = new Date(res.data.StartTime);

  return refined;
}
