"use server";

import { cookies } from "next/headers";
import { single_student_interests } from "../(student)/fake";
import {
  fakeAvailabilities,
  fakeBookedSessions,
  fakeGroupSessionInfos,
  fakeGroupSessionParticipants,
  FakeMentorInfo,
  FakeMentorList,
  fakeSessionsSuggestionStudentDashboard,
  fakeSingleMentorAvailability,
  fakeSingleSessionInfo,
  FakeStudentInfo,
  getFakeSessionInfo,
  mentorAvailableAt,
} from "../data/fake";
import { MentorSuggestionType } from "../types";

const USE_FAKE: boolean = false;
export type ApiRequestType = {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  ignoreError?: boolean;
  contentType?: boolean;
};

export async function apiRequest({
  endpoint,
  method = "GET",
  body,
  auth = true,
  ignoreError,
  contentType = true,
}: ApiRequestType) {
  if (USE_FAKE) {
    return fakeApiRequest(endpoint);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("Authentication token missing");
    }
    console.log("added token to the req : ", token);
    headers["Authorization"] = `Bearer ${token}`;
  }
  const url = `${apiUrl}/${endpoint}`;

  console.log("Sending Request to ", url);
  console.log("provided method ", method);
  console.log("body ", body);

  const res = await fetch(url, {
    method,
    headers,
    ...(typeof body === "object" && body !== null
      ? { body: JSON.stringify(body) }
      : {}),
  });
  console.log("response status code ", res.status);

  if (!ignoreError) {
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        `API Error ${res.status}: ${res.statusText}. ${
          errorData?.message || ""
        }`,
      );
    }
  }
  return res.json();
}

async function fakeApiRequest(endpoint: string): Promise<unknown> {
  console.log("Fake API request", endpoint);
  if (endpoint === "api/student/interests/list") {
    return { success: true, data: single_student_interests };
  } else if (endpoint === "api/mentor/interests/list") {
    return { success: true, data: single_student_interests };
  } else if (endpoint === "api/student/interests/fakeMentorId") {
    return { success: true, data: single_student_interests };
  } else if (endpoint === "api/student/fakeStudentId") {
    return { success: true, data: FakeStudentInfo };
  } else if (endpoint === "api/student/myself") {
    return { success: true, data: FakeStudentInfo };
  } else if (endpoint === "api/mentor/myself") {
    return {
      success: true,
      data: FakeMentorInfo,
    };
  } else if (endpoint === "api/mentor/fakeMentorId") {
    return {
      success: true,
      data: FakeMentorInfo,
    };
  } else if (endpoint === "api/mentor/public/fakeMentorId") {
    return {
      success: true,
      data: FakeMentorInfo,
    };
  } else if (endpoint === "api/mentor/level/fakeMentorId") {
    return {
      success: true,
      data: "trailblazer",
    };
  } else if (endpoint === "api/student/interests/update") {
    return {
      success: true,
      message: "Student interests updated successfully",
      interestsUpdated: 2,
      interests: single_student_interests,
    };
  } else if (endpoint === "api/mentor/sessions") {
    // this should give sessions of a single mentor
    return { success: true, data: [] };
  } else if (endpoint.includes("api/mentor/booked/closest?t=")) {
    //const t = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const t2 = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    return {
      success: true,
      data: {
        SessionId: "fakeSessionId",
        SessionTitle: "Physics Mid Term Question Solution",
        StartTime: t2,
        DurationInMinutes: 90,
      },
    };
  } else if (endpoint.includes("api/student/booked/closest?t=")) {
    //const t = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const t2 = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    return {
      success: true,
      data: {
        SessionId: "fakeSessionId",
        SessionTitle: "Physics Mid Term Question Solution",
        StartTime: t2,
        DurationInMinutes: 90,
      },
    };
  } else if (endpoint === "api/student/sessions/fakeSessionId") {
    return {
      success: true,
      data: fakeSingleSessionInfo,
    };
  } else if (endpoint === `api/student/payment/fakeSessionId`) {
    return {
      success: true,
    };
  } else if (endpoint === "api/student/sessions") {
    return {
      success: true,
      data: fakeSessionsSuggestionStudentDashboard,
    };
  } else if (endpoint === "api/mentor/avalability/add") {
    return {
      success: true,
    };
  } else if (endpoint === "api/mentor/availability/list") {
    return {
      success: true,
      data: fakeAvailabilities,
    };
  } else if (endpoint === "api/student/mavaliableat/fakeMentorId") {
    return {
      success: true,
      data: mentorAvailableAt,
    };
  } else if (endpoint === "api/student/mavailableat/request") {
    return {
      success: true,
      message: "Slot Requests are sent successfully",
    };
  } else if (endpoint === "api/student/findmentor/interest") {
    return { success: true, data: FakeMentorList };
  } else if (endpoint === "api/student/findmentor/level") {
    const cpy: MentorSuggestionType[] = [...FakeMentorList];
    const shuffled = (arr: MentorSuggestionType[]) =>
      arr.sort(() => Math.random() - 0.5);
    console.log(shuffled);
    return { success: true, data: shuffled(cpy) };
  } else if (endpoint === `api/student/mavaliableat/fakeid8`) {
    return {
      success: true,
      data: fakeSingleMentorAvailability,
    };
  } else if (endpoint === `api/groupsessions/`) {
    return {
      success: true,
      data: fakeGroupSessionInfos,
    };
  } else if (endpoint === `api/groupsessions/gsid`) {
    return {
      success: true,
      data: fakeGroupSessionInfos[0],
    };
  } else if (endpoint === `api/groupsessions/participantlist/gsid`) {
    return {
      success: true,
      data: fakeGroupSessionParticipants,
    };
  } else if (endpoint === `api/groupsessions/join`) {
    return {
      success: true,
      data: {
        meetingLink: "https://meet.google.com/landing",
      },
    };
  } else if (endpoint === `api/groupsessions/cancel`) {
    return {
      success: true,
    };
  } else if (endpoint === `api/groupsessions/mentor/fakeMentorId`) {
    return {
      success: true,
      data: fakeGroupSessionInfos,
    };
  } else if (endpoint === `api/groupsessions/create`) {
    return {
      success: true,
      data: fakeGroupSessionInfos[0],
    };
  } else if (endpoint === `api/student/booked/fakeStudentId`) {
    return {
      success: true,
      data: fakeBookedSessions,
    };
  } else if (endpoint === `api/sessions/fakeSessionId`) {
    return {
      success: true,
      data: fakeSingleSessionInfo,
    };
  } else if (endpoint === `api/sessions/mentor`) {
    return {
      success: true,
      data: [getFakeSessionInfo(), getFakeSessionInfo(), getFakeSessionInfo()],
    };
  } else if (endpoint === `api/sessions/student/others`)
    return {
      success: true,
      data: fakeSessionsSuggestionStudentDashboard,
    };
  else if (endpoint === `api/sessions/student/interest`) {
    return {
      success: true,
      data: fakeSessionsSuggestionStudentDashboard,
    };
  } else {
    return { success: false, message: "Unknown endpoint" };
  }
}
