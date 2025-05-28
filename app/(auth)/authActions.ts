// "use server";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { StudentRegisterDataType } from "./sign-up/ui/SignupStudent";
// import { apiRequest, ApiRequestType } from "../lib/apiClient";
// import { MentorRegisterDataType } from "./sign-up/ui/SignupMentor";
// import { getAvatar } from "@/app/utils/utility";
// //import type { SignUpFormValues } from "@/app/(student)/ui/SignUpForm";

// export async function registerStudent(data: StudentRegisterDataType) {
//   const req: ApiRequestType = {
//     endpoint: `api/student/register`,
//     method: "POST",
//     body: {
//       name: data.name,
//       email: data.email,
//       username: data.username,
//       gender: data.gender,
//       grad_year: data.grad_year,
//       dob: data.dob.toISOString(),
//       password: data.password,
//       image: getAvatar(data.username),
//     },
//     auth: false,
//   };

//   const response = await apiRequest(req);
//   if (!response.success) {
//     return {
//       sid: null,
//       error: "Registration Failed, Try again with correct data.",
//     };
//   }
//   const jwt = response.jwtToken;

//   const cookieStore = await cookies();
//   cookieStore.set("auth_token", jwt, {
//     path: "/",
//     sameSite: "lax",
//   });

//   return {
//     sid: response.student_id,
//     error: null,
//   };
// }

// export async function registerMentor(data: MentorRegisterDataType) {
//   const req: ApiRequestType = {
//     endpoint: `api/mentor/register`,
//     method: "POST",
//     body: {
//       name: data.name,
//       email: data.email,
//       username: data.username,
//       gender: data.gender,
//       grad_year: data.grad_year,
//       socials: {
//         github: data.socials.github,
//         facebook: data.socials.facebook,
//         linkedin: data.socials.linkedin,
//         twitter: data.socials.twitter,
//       },
//       dob: data.dob.toISOString(),
//       password: data.password,
//       image: getAvatar(data.username),
//     },
//     auth: false,
//   };

//   console.log(req.body);

//   const response = await apiRequest(req);
//   if (!response.success) {
//     return {
//       mid: null,
//       error: "Registration Failed, Try again with correct data.",
//     };
//   }
//   const jwt = response.jwtToken;

//   const cookieStore = await cookies();
//   cookieStore.set("auth_token", jwt, {
//     path: "/",
//     sameSite: "lax",
//   });
//   console.log(response);
//   return {
//     mid: response.mentor_id,
//     error: null,
//   };
// }

// export async function mentorSignIn(data: { email: string; password: string }) {
//   const req: ApiRequestType = {
//     endpoint: `api/mentor/login`,
//     method: "POST",
//     body: {
//       email: data.email,
//       password: data.password,
//     },
//     auth: false,
//     ignoreError: true,
//   };

//   const response = await apiRequest(req);
//   if (!response.success) {
//     return {
//       mid: null,
//       error: "Wrong Credentials or Not a Mentor.",
//     };
//   }
//   const jwt = response.jwtToken;

//   const cookieStore = await cookies();
//   cookieStore.set("auth_token", jwt, {
//     path: "/",
//     sameSite: "lax",
//   });

//   return {
//     mid: response.mentor_id,
//     error: null,
//   };
// }

// export async function studentSignIn(data: { email: string; password: string }) {
//   const req: ApiRequestType = {
//     endpoint: `api/student/login`,
//     method: "POST",
//     body: {
//       email: data.email,
//       password: data.password,
//     },
//     auth: false,
//     ignoreError: true,
//   };

//   const response = await apiRequest(req);
//   if (!response.success) {
//     return {
//       sid: null,
//       error: "Wrong Credentials or Not a Student.",
//     };
//   }
//   const jwt = response.jwtToken;

//   const cookieStore = await cookies();
//   cookieStore.set("auth_token", jwt, {
//     path: "/",
//     sameSite: "lax",
//   });

//   return {
//     sid: response.student_id,
//     error: null,
//   };
// }

// export async function clearCookie() {
//   const cookieStore = await cookies();
//   cookieStore.delete("auth_token");
// }





"use server";
import { cookies } from "next/headers";
import { StudentRegisterDataType } from "./sign-up/ui/SignupStudent";
import { apiRequest, ApiRequestType } from "../lib/apiClient";
import { MentorRegisterDataType } from "./sign-up/ui/SignupMentor";
import { getAvatar } from "@/app/utils/utility";

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

  try {
    const response = await apiRequest(req);
    if (!response.success) {
      return {
        sid: null,
        error: response.message || "Registration failed. Please try again.",
      };
    }
    const cookieStore = await cookies();
    cookieStore.set("auth_token", response.jwtToken, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return {
      sid: response.student_id,
      // jwtToken: response.jwtToken,
      error: null,
    };
  } catch (error: any) {
    console.error("Student Registration Error:", error);
    return {
      sid: null,
      error: error.message || "Registration failed. Please try again.",
    };
  }
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

  try {
    const response = await apiRequest(req);
    if (!response.success) {
      return {
        mid: null,
        error: response.message || "Registration failed. Please try again.",
      };
    }
    const cookieStore = await cookies();
    cookieStore.set("auth_token", response.jwtToken, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return {
      mid: response.mentor_id,
      error: null,
    };
  } catch (error: any) {
    console.error("Mentor Registration Error:", error);
    return {
      mid: null,
      error: error.message || "Registration failed. Please try again.",
    };
  }
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

  try {
    const response = await apiRequest(req);
    if (!response.success || !response.jwtToken) {
      console.error("Mentor Sign-In Failed:", response.message);
      return {
        mid: null,
        error: response.message || "Invalid email or password.",
      };
    }
    const cookieStore = await cookies();
    cookieStore.set("auth_token", response.jwtToken, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return {
      mid: response.mentor_id,
      error: null,
    };
  } catch (error: any) {
    console.error("Mentor Sign-In Error:", {
      message: error.message,
      status: error.status,
    });
    return {
      mid: null,
      error: error.message || "Sign-in failed. Please try again.",
    };
  }
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

  try {
    const response = await apiRequest(req);
    if (!response.success || !response.jwtToken) {
      console.error("Student Sign-In Failed:", response.message);
      return {
        sid: null,
        error: response.message || "Invalid email or password.",
      };
    }
    const cookieStore = await cookies();
    cookieStore.set("auth_token", response.jwtToken, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return {
      sid: response.student_id,
      error: null,
    };
  } catch (error: any) {
    console.error("Student Sign-In Error:", {
      message: error.message,
      status: error.status,
    });
    return {
      sid: null,
      error: error.message || "Sign-in failed. Please try again.",
    };
  }
}

export async function clearCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
