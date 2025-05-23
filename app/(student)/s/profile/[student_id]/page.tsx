import Profile from "@/app/ui/Profile";
import { InterestType } from "@/app/types";
// import { cookies } from "next/headers";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
// import { single_student_interests } from "@/app/(student)/fake";
type Props = { params: Promise<{ student_id: string }> };

const page = async ({ params }: Props) => {
  const sID = (await params).student_id;
  console.log(sID);
  const req: ApiRequestType = {
    endpoint: `api/student/interests/list`,
    method: "GET",
    auth: true,
  };
  const fetchedInterests: InterestType[] = (await apiRequest(req)).data;
  return (
    <div>
      <Profile student interests={fetchedInterests} query_id={sID} />
    </div>
  );
};

export default page;
