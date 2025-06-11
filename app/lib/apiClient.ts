// app/lib/apiClient.ts
"use server";

import { cookies } from "next/headers";

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
  ignoreError = false,
  contentType = true,
}: ApiRequestType) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token && !ignoreError) {
      const error = new Error("Authentication token missing");
      (error as any).status = 401;
      throw error;
    }
    if (token) {
      console.log("API Request: Adding token to headers");
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${apiUrl}/${endpoint}`;

  console.log(`API Request: ${method} ${url}`);
  if (body) console.log("API Request Body:", body);

  try {
    const res = await fetch(url, {
      method,
      headers,
      ...(body && typeof body === "object" ? { body: JSON.stringify(body) } : {}),
    });

    console.log(`API Response Status: ${res.status}`);

    const data = await res.json().catch(() => ({}));

    if (!res.ok && !ignoreError) {
      const error: any = new Error(
        `API Error ${res.status}: ${res.statusText}. ${data.error || "Unknown error"}`
      );
      error.status = res.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error(`API Request Error: ${method} ${url}`, {
      message: error.message,
      status: error.status,
      response: error.response,
    });
    if (!ignoreError) throw error;
    return { success: false, error: error.message };
  }
}
