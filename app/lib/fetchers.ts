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

const refineGroupSessionData = <T extends GroupSessionInfoType | GroupSessionInfoType[]>(data: T): T => {
  const refineSingle = (gs: GroupSessionInfoType): GroupSessionInfoType => {

    return {
      ...gs,
      // ...gs.status, 
      mentor: {
        ...gs.mentor,
        photoLink: gs.mentor?.photoLink?.length > 0 ? gs.mentor.photoLink : getAvatar(gs.mentor?.id ?? ''),
      },
      previewParticipants: gs.previewParticipants?.map((p) => ({
        ...p,
        photoLink: p.photoLink?.length > 0 ? p.photoLink : getAvatar(p.id ?? ''),
      })) ?? [],
    };
  };

  return Array.isArray(data) ? data.map(refineSingle) as T : refineSingle(data) as T;
};

export async function getGroupSessionsList(): Promise<GroupSessionInfoType[]> {
  const req: ApiRequestType = {
    endpoint: 'api/groupsessions/',
    method: 'GET',
    auth: true,
  };

  try {
    const res = await apiRequest(req);
    if (!res.success || !res.data) {
      throw new Error('Failed to fetch group sessions list');
    }
    return refineGroupSessionData(res.data as GroupSessionInfoType[]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching group sessions list: ${error.message}`);
    } else {
      throw new Error('Error fetching group sessions list: Unknown error');
    }
  }
}

export async function getGroupSessionsById(gsid: string): Promise<GroupSessionInfoType> {
  if (!gsid || typeof gsid !== 'string') {
    throw new Error('Invalid or missing group session ID');
  }

  const req: ApiRequestType = {
    endpoint: `api/groupsessions/${gsid}`,
    method: 'GET',
    auth: true,
  };

  try {
    const res = await apiRequest(req);
    if (!res.success || !res.data) {
      throw new Error(`Failed to fetch group session with ID: ${gsid}`);
    }
    const data = {
      ...res.data,
      startTime: typeof res.data.startTime === 'string' ? new Date(res.data.startTime) : res.data.startTime,
    };
    return refineGroupSessionData(data as GroupSessionInfoType);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching group session with ID ${gsid}: ${error.message}`);
    } else {
      throw new Error(`Error fetching group session with ID ${gsid}: Unknown error`);
    }
  }
}

export async function getGroupSessionListByMentorId(mID: string): Promise<GroupSessionInfoType[]> {
  if (!mID || typeof mID !== 'string') {
    throw new Error('Invalid or missing mentor ID');
  }

  const req: ApiRequestType = {
    endpoint: `api/groupsessions/mentor/${mID}`,
    method: 'GET',
    auth: true,
  };

  try {
    const res = await apiRequest(req);
    if (!res.success || !res.data) {
      throw new Error(`Failed to fetch group sessions for mentor ID: ${mID}`);
    }
    return refineGroupSessionData(res.data as GroupSessionInfoType[]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching group sessions for mentor ID ${mID}: ${error.message}`);
    } else {
      throw new Error(`Error fetching group sessions for mentor ID ${mID}: Unknown error`);
    }
  }
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