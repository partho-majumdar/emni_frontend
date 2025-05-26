import {
  AvalabilityType,
  InterestType,
  MentorInfoType,
  SessionInfoType,
  GroupSessionInfoType,
} from "@/app/types";
import { apiRequest, ApiRequestType } from "../apiClient";

export async function addAvailability(
  start: Date,
  end: Date,
  medium: ("online" | "offline")[]
) {
  const req: ApiRequestType = {
    endpoint: "api/mentor/availability/add",
    method: "POST",
    body: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      medium: medium,
    },
    auth: true,
  };
  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Adding Avalability Failed.");
  }
}

export async function deleteAvailability(availability: AvalabilityType) {
  const req: ApiRequestType = {
    endpoint: `api/mentor/availability/${availability.id}`,
    method: "DELETE",
    auth: true,
  };
  const res = await apiRequest(req);
  return res.success;
}

export async function updateInterestListMentor(interests: InterestType[]) {
  const req: ApiRequestType = {
    endpoint: "api/mentor/interests/list",
    method: "PUT",
    body: {
      interestIds: interests.map((i) => {
        return i.interest_id;
      }),
    },
    auth: true,
  };
  const res = await apiRequest(req);
  return res;
}

export async function updateMentorProfile(
  data: MentorInfoType,
  imageFile: null | File
) {
  const req: ApiRequestType = {
    endpoint: "api/mentor/myself",
    method: "PUT",
    body: {
      name: data.name,
      email: data.email,
      username: data.username,
      gender: data.gender,
      grad_year: data.grad_year,
      bio: data.bio,
      socials: {
        github: data.socials.github,
        facebook: data.socials.facebook,
        linkedin: data.socials.linkedin,
        twitter: data.socials.twitter,
      },
      password: data.password,
      dob: data.dob.toISOString(),
      image: imageFile,
    },
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    console.error(req.body);
    throw new Error("Failed to update mentor profile");
  }
}

export async function createSession(sinfo: SessionInfoType) {
  const req: ApiRequestType = {
    endpoint: "api/sessions/new",
    method: "POST",
    body: {
      title: sinfo.title,
      type: sinfo.type,
      DurationInMinutes: sinfo.DurationInMinutes,
      session_medium: sinfo.session_medium,
      Description: sinfo.Description,
      Price: sinfo.Price,
    },
    auth: true,
    ignoreError: true,
  };
  const res = await apiRequest(req);
  if (res.ok) {
    return {
      err: null,
      data: res.data,
    };
  } else {
    return {
      err: res.error,
      data: null,
    };
  }
}

export async function deleteSession(sessID: string) {
  const req: ApiRequestType = {
    endpoint: `api/sessions/${sessID}`,
    method: "DELETE",
    auth: true,
  };
  const res = await apiRequest(req);
  return res.success;
}

export async function updateSession(sinfo: SessionInfoType) {
  const req: ApiRequestType = {
    endpoint: `api/sessions/${sinfo.sessionId}`,
    method: "PUT",
    body: {
      title: sinfo.title,
      type: sinfo.type,
      DurationInMinutes: sinfo.DurationInMinutes,
      session_medium: sinfo.session_medium,
      Description: sinfo.Description,
      Price: sinfo.Price,
    },
    auth: true,
  };
  const res = await apiRequest(req);
  if (res.success) {
    return true;
  } else {
    console.error("UPDATE SESSION by Mentor>Failed to update session");
    return false;
  }
}

export async function createGroupSession(sessionInfo: {
  title: string;
  description: string;
  durationInMinutes: number;
  startTime: Date;
  maxParticipant: number;
  platform_link: string;
}) {
  const req: ApiRequestType = {
    endpoint: "api/groupsessions/create",
    method: "POST",
    body: {
      title: sessionInfo.title,
      description: sessionInfo.description,
      durationInMinutes: sessionInfo.durationInMinutes,
      startTime: sessionInfo.startTime.toISOString(),
      maxParticipant: sessionInfo.maxParticipant,
      platform_link: sessionInfo.platform_link,
    },
    auth: true,
    ignoreError: false,
  };

  const res = await apiRequest(req);
  if (res.success) {
    return {
      success: true,
      data: res.data as GroupSessionInfoType,
    };
  } else {
    return {
      success: false,
      error: res.error || "Failed to create group session",
    };
  }
}


export async function updateGroupSession(
  sessionInfo: GroupSessionInfoType
): Promise<{ success: boolean; error?: string }> {
  try {
    const req: ApiRequestType = {
      endpoint: `api/groupsessions/${sessionInfo.id}`,
      method: "PUT",
      body: {
        title: sessionInfo.title,
        description: sessionInfo.description,
        durationInMinutes: sessionInfo.durationInMinutes,
        startTime: sessionInfo.startTime.toISOString(),
        maxParticipant: sessionInfo.participants.max,
        platform_link: sessionInfo.platform_link,
      },
      auth: true,
      ignoreError: false,
    };

    console.log("Sending update request to:", req.endpoint); // Debug log
    console.log("Request body:", req.body); // Debug log
    const res = await apiRequest(req);
    console.log("API response:", res); // Debug log

    if (!res.success) {
      console.error("API request failed with error:", res.error);
      return {
        success: false,
        error: res.error || "Failed to update group session",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateGroupSession:", error.message, error.stack); // Detailed error log
    return {
      success: false,
      error: error.message || "Unexpected error updating group session",
    };
  }
}

export async function deleteGroupSession(groupSessionId: string) {
  const req: ApiRequestType = {
    endpoint: `api/groupsessions/delete/${groupSessionId}`,
    method: "DELETE",
    auth: true,
    ignoreError: false,
  };

  const res = await apiRequest(req);
  if (res.success) {
    return {
      success: true,
      data: res.data as GroupSessionInfoType,
    };
  } else {
    return {
      success: false,
      error: res.error || "Failed to delete group session",
    };
  }
}