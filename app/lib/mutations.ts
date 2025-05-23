import { apiRequest, ApiRequestType } from "./apiClient";

export async function joinGroupSession(studentId: string, gsid: string) {
  const req: ApiRequestType = {
    endpoint: "api/groupsessions/join",
    method: "POST",
    body: {
      GroupSessionId: gsid,
      ParticipantId: studentId,
    },
    auth: true,
    ignoreError: true,
  };

  const res = await apiRequest(req);
  /*
   * Response format
    ---  on fail
        {
            "success": false,
            "message": "Student is already a participant in this group session with status 'registered'"
        }
   */
  return res;
}
export async function deleteGroupSession(gsid: string) {
  const req: ApiRequestType = {
    endpoint: `api/groupsessions/delete/${gsid}`,
    method: "DELETE",
    body: {
      GroupSessionId: gsid,
    },
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Error deleting group session");
  }
  return res.success;
}

// cancel registration of student in group session
export async function cancelGroupSession(studentId: string, gsid: string) {
  const req: ApiRequestType = {
    endpoint: "api/groupsessions/cancel",
    method: "PUT",
    body: {
      GroupSessionId: gsid,
      ParticipantId: studentId,
    },
    auth: true,
  };

  const res = await apiRequest(req);
  if (!res.success) {
    throw new Error("Error Cancelling  Group session");
  }
  return res.success;
}

export async function createGroupSession(Body: {
  title: string;
  description: string;
  startTime: Date;
  durationInMinutes: number;
  maxParticipant: number;
  platform_link: string;
}) {
  const req: ApiRequestType = {
    endpoint: "api/groupsessions/create",
    method: "POST",
    body: Body,
    auth: true,
  };

  const res = await apiRequest(req);
  return res.success;
}
