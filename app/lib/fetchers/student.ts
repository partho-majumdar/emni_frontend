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

  return studentPersonalInfo;
}

export async function getMentorAvailableSlots(mID: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/mavaliableat/${mID}`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);

  let slotsData: RawSlot[] = [];
  if (Array.isArray(res)) {
    slotsData = res;
  } else if (res && typeof res === 'object' && 'availability' in res && Array.isArray(res.availability)) {
    slotsData = res.availability;
  } else {
    console.error("Invalid API response:", res);
    return [];
  }

  interface RawSlot {
    id: string;
    start: string;
    end: string;
    booked?: any[];
    medium?: string[] | string;
  }

  const data: AvalabilityType[] = slotsData
    .map((slot: RawSlot): AvalabilityType | null => {
      try {
        return {
          id: slot.id,
          start: new Date(slot.start),
          end: new Date(slot.end),
          booked: slot.booked || [], 
          medium: Array.isArray(slot.medium)
            ? slot.medium.filter((m): m is "online" | "offline" => m === "online" || m === "offline")
            : ["online"], 
        };
      } catch (e) {
        console.error(`Invalid date format for slot ${slot.id}:`, slot.start, slot.end);
        return null;
      }
    })
    .filter((slot): slot is AvalabilityType => slot !== null);

  const unbookedSlots = data.filter((slot) => {
    return Array.isArray(slot.booked) && slot.booked.length === 0;
  });
  return unbookedSlots;
}


export async function getMentorAvailabliltyById(aId: string) {
  const req: ApiRequestType = {
    endpoint: `api/student/mavaliableat/aid/${aId}`,
    method: "GET",
    auth: true, 
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
  if (!res.success) {
    throw new Error("Error fetching Booked Sessions");
  }
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
  const refined: StudentInfoType = { ...res.data };
  refined.dob = new Date(res.data.dob);
  refined.image_link =
    res.data.image_link.length > 0
      ? res.data.image_link
      : getAvatar(res.data.username);
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
