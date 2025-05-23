"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StudentRegisterDataType } from "./sign-up/ui/SignupStudent";
import { apiRequest, ApiRequestType } from "../lib/apiClient";
import { MentorRegisterDataType } from "./sign-up/ui/SignupMentor";
import { getAvatar } from "@/app/utils/utility";
//import type { SignUpFormValues } from "@/app/(student)/ui/SignUpForm";

export async function registerStudent(data: StudentRegisterDataType) {
  const req: ApiRequestType = {
    endpoint: `api/student/register`,
    method: "POST",
    body: {
      name: data.name,
      email: data.email,
      username: data.username,
      gender: data.gender,
      grad_year: data.grad_year,
      dob: data.dob.toISOString(),
      password: data.password,
      image: getAvatar(data.username),
    },
    auth: false,
  };

  const response = await apiRequest(req);
  if (!response.success) {
    return {
      sid: null,
      error: "Registration Failed, Try again with correct data.",
    };
  }
  const jwt = response.jwtToken;

  const cookieStore = await cookies();
  cookieStore.set("auth_token", jwt, {
    path: "/",
    sameSite: "lax",
  });

  return {
    sid: response.student_id,
    error: null,
  };
}

export async function registerMentor(data: MentorRegisterDataType) {
  const req: ApiRequestType = {
    endpoint: `api/mentor/register`,
    method: "POST",
    body: {
      name: data.name,
      email: data.email,
      username: data.username,
      gender: data.gender,
      grad_year: data.grad_year,
      socials: {
        github: data.socials.github,
        facebook: data.socials.facebook,
        linkedin: data.socials.linkedin,
        twitter: data.socials.twitter,
      },
      dob: data.dob.toISOString(),
      password: data.password,
      image: getAvatar(data.username),
    },
    auth: false,
  };

  console.log(req.body);

  const response = await apiRequest(req);
  if (!response.success) {
    return {
      mid: null,
      error: "Registration Failed, Try again with correct data.",
    };
  }
  const jwt = response.jwtToken;

  const cookieStore = await cookies();
  cookieStore.set("auth_token", jwt, {
    path: "/",
    sameSite: "lax",
  });
  console.log(response);
  return {
    mid: response.mentor_id,
    error: null,
  };
}

export async function mentorSignIn(data: { email: string; password: string }) {
  const req: ApiRequestType = {
    endpoint: `api/mentor/login`,
    method: "POST",
    body: {
      email: data.email,
      password: data.password,
    },
    auth: false,
    ignoreError: true,
  };

  const response = await apiRequest(req);
  if (!response.success) {
    return {
      mid: null,
      error: "Wrong Credentials or Not a Mentor.",
    };
  }
  const jwt = response.jwtToken;

  const cookieStore = await cookies();
  cookieStore.set("auth_token", jwt, {
    path: "/",
    sameSite: "lax",
  });

  return {
    mid: response.mentor_id,
    error: null,
  };
}

export async function studentSignIn(data: { email: string; password: string }) {
  const req: ApiRequestType = {
    endpoint: `api/student/login`,
    method: "POST",
    body: {
      email: data.email,
      password: data.password,
    },
    auth: false,
    ignoreError: true,
  };

  const response = await apiRequest(req);
  if (!response.success) {
    return {
      sid: null,
      error: "Wrong Credentials or Not a Student.",
    };
  }
  const jwt = response.jwtToken;

  const cookieStore = await cookies();
  cookieStore.set("auth_token", jwt, {
    path: "/",
    sameSite: "lax",
  });

  return {
    sid: response.student_id,
    error: null,
  };
}

export async function clearCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
