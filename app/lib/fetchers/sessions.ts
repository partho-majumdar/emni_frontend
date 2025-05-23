import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { SessionInfoType } from "@/app/types";
import { getAvailabilities } from "./mentor";
import { getAvatar, resolveImageLink } from "@/app/utils/utility";

export async function getSessionsMentor() {
  const req: ApiRequestType = {
    endpoint: `api/sessions/mentor/list`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);
  if (res.success === false) {
    throw new Error("Failed to fetch mentor sessions");
  }
  const data: SessionInfoType[] = res.data;
  console.log("Mentor sessions", data);
  return data;
}

export async function getSessionsForStudentBasedOnInterest() {
  const req: ApiRequestType = {
    endpoint: `api/sessions/student/interest`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);
  if (res.success === false) {
    throw new Error("Failed to fetch student sessions");
  }
  const data: SessionInfoType[] = res.data;
  const refined: SessionInfoType[] = data.map((s: SessionInfoType) => {
    return {
      ...s,
      mentorImageLink:
        s.mentorImageLink && s.mentorId && s.mentorImageLink?.length > 0
          ? s.mentorImageLink
          : getAvatar(s.mentorId as string),
    };
  });

  return refined;
}
export async function getSessionsForStudentOuterInterests() {
  console.log("sessions outside similar interests");
}

export async function getSessionBySessionID(sID: string) {
  const req: ApiRequestType = {
    endpoint: `api/sessions/${sID}`,
    method: "GET",
    auth: true,
  };
  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error(`Failed to fetch session with id ${sID}`);
  }
  const data: SessionInfoType = res.data;
  data.mentorImageLink = resolveImageLink(data.mentorImageLink, data.mentorId!);
  return data;
}
