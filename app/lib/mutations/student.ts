import { AvalabilityType, InterestType, StudentInfoType } from "@/app/types";
import { apiRequest, ApiRequestType } from "../apiClient";

export async function sendSlotRequest(mId: string, slots: AvalabilityType[]) {
  const req: ApiRequestType = {
    endpoint: "api/student/mavailableat/request",
    method: "POST",
    body: {
      mentorId: mId,
      slots: slots,
    },
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to send slot requests");
  }
  console.log(res);
}

export async function bookSession(
  sessionID: string,
  availabilityID: string,
  medium: string,
) {
  const req: ApiRequestType = {
    endpoint: `api/student/payment/${sessionID}`,
    method: "POST",
    body: {
      AvailabilityID: availabilityID,
      medium: medium,
    },
    auth: true,
  };

  const res = await apiRequest(req);
  return res.success;
}

export async function updateInterestListStudent(interests: InterestType[]) {
  const req: ApiRequestType = {
    endpoint: "api/student/interests/list",
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

export async function updateStudentProfile(
  data: StudentInfoType,
  imageFile: File | null,
) {
  const req: ApiRequestType = {
    endpoint: "api/student/myself",
    method: "PUT",
    body: {
      name: data.name,
      email: data.email,
      username: data.username,
      gender: data.gender,
      grad_year: data.grad_year,
      dob: data.dob.toISOString(),
      password: data.password,
      image: imageFile,
      bio: data.bio,
    },
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to update student profile");
  }
  return res;
}
