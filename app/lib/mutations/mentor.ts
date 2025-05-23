import {
  AvalabilityType,
  InterestType,
  MentorInfoType,
  SessionInfoType,
  SessionType,
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

// ------------ above code written by rafi ------------------








//export async function updateMentorProfile(
//  data: MentorInfoType,
//  imageFile: File | null,
//) {
//  const formData = new FormData();
//
//  formData.append("name", data.name);
//  formData.append("email", data.email);
//  formData.append("username", data.username);
//  formData.append("grad_year", data.grad_year.toString());
//  formData.append("bio", data.bio);
//  formData.append("password", data.password);
//  formData.append("dob", data.dob.toISOString());
//  formData.append("socials[github]", data.socials.github || "");
//  formData.append("socials[facebook]", data.socials.facebook || "");
//  formData.append("socials[linkedin]", data.socials.linkedin || "");
//  formData.append("socials[twitter]", data.socials.twitter || "");
//
//  if (imageFile) {
//    formData.append("image", imageFile);
//  }
//  const req: ApiRequestType = {
//    endpoint: "api/mentor/myself",
//    method: "PUT",
//    body: formData,
//    auth: true,
//    contentType: false,
//  };
//  console.log(req.body);
//
//  const res = await apiRequest(req);
//  if (res.success) {
//    console.log("Profile updated successfully");
//    console.log(res.data);
//  } else {
//    console.error("Failed to update profile");
//  }
//}
//
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
