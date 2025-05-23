import { getMentorPublicProfile } from "@/app/lib/fetchers/mentor";
import { MentorPublicProfileType } from "@/app/types";
import MentorProfile from "@/app/ui/MentorProfile";
type Props = { params: Promise<{ mentor_id: string }> };

const page = async ({ params }: Props) => {
  const mID = (await params).mentor_id;
  const mData: MentorPublicProfileType = await getMentorPublicProfile(mID);
  console.log(mData);
  return (
    <div>
      <MentorProfile MentorProfile={mData} />
    </div>
  );
};

export default page;
