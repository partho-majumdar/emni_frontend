import { Group } from "next/dist/shared/lib/router/utils/route-regex";
import { apiRequest, ApiRequestType } from "./apiClient";
import { GroupSessionInfoType, GroupSessionParticipantInfo } from "../types";
import { getAvatar } from "../utils/utility";

// public api calls

export async function getEntireInterestsList() {
  const req: ApiRequestType = {
    endpoint: "api/interests",
    method: "GET",
    auth: false,
  };
  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Failed to fetch entire interests list");
  }
  return res.data;
}

/// these functions should be in the inner folders for separate auth
export async function getGroupSessionsList() {
  const req: ApiRequestType = {
    endpoint: "api/groupsessions/",
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  console.log("group sessions", res);
  if (!res.success) {
    throw new Error("Error fetching Group Sessions List");
  }
  const data: GroupSessionInfoType[] = res.data;
  const refined = data.map((gs: GroupSessionInfoType) => {
    return {
      ...gs,
      mentor: {
        ...gs.mentor,
        photoLink:
          gs.mentor.photoLink && gs.mentor.photoLink.length > 0
            ? gs.mentor.photoLink
            : getAvatar(gs.mentor.id),
      },
      previewParticipants: gs.previewParticipants.map(
        (p: { id: string; name: string; photoLink: string }) => {
          return {
            ...p,
            photoLink:
              p.photoLink && p.photoLink.length > 0
                ? p.photoLink
                : getAvatar(p.id),
          };
        },
      ),
    };
  });
  console.log("refined", refined);
  return refined;
}

export async function getGroupSessionsById(gsid: string) {
  const req: ApiRequestType = {
    endpoint: `api/groupsessions/${gsid}`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Error fetching Group Sessions List");
  }
  const data: GroupSessionInfoType = {
    ...res.data,
    mentor: {
      ...res.data.mentor,
      photoLink:
        res.data.mentor.photoLink && res.data.mentor.photoLink.length > 0
          ? res.data.mentor.photoLink
          : getAvatar(res.data.mentor.id),
    },
  };
  return data;
}

export async function getGroupSessionParticipants(gsid: string) {
  const req: ApiRequestType = {
    endpoint: `api/groupsessions/participantlist/${gsid}`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  console.log(res);

  if (!res.success) {
    throw new Error(
      `Error fetching participants for Group Session ID: ${gsid}`,
    );
  }
  const data: GroupSessionParticipantInfo[] = res.data;
  const refined = data.map((p: GroupSessionParticipantInfo) => {
    return {
      ...p,
      photoLink:
        p.photoLink && p.photoLink.length > 0 ? p.photoLink : getAvatar(p.id),
    };
  });
  return refined;
}

export async function getGroupSessionListByMentorId(mID: string) {
  const req: ApiRequestType = {
    endpoint: `api/groupsessions/mentor/${mID}`,
    method: "GET",
    auth: true,
  };

  const res = await apiRequest(req);
  console.log(res);
  if (!res.success) {
    throw new Error("Error fetching Group Sessions List By Mentor ID");
  }
  const data: GroupSessionInfoType[] = res.data;
  const refined = data.map((gs: GroupSessionInfoType) => {
    return {
      ...gs,
      mentor: {
        ...gs.mentor,
        photoLink:
          gs.mentor.photoLink && gs.mentor.photoLink.length > 0
            ? gs.mentor.photoLink
            : getAvatar(gs.mentor.id),
      },
      previewParticipants: gs.previewParticipants.map(
        (p: { id: string; name: string; photoLink: string }) => {
          return {
            ...p,
            photoLink:
              p.photoLink && p.photoLink.length > 0
                ? p.photoLink
                : getAvatar(p.id),
          };
        },
      ),
    };
  });
  return refined;
}
