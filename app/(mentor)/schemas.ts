import { z } from "zod";

export const genderSchema = z.enum(["Male", "Female"]);
// {
//     "name": "new mentor 3",
//     "email": "newmentor3@gmail.com",
//     "username": "newmentor3",
//     "gender": "Female",
//     "social_link": "github.com/emni3",
//     "organization": "UIU",
//     "is_approved": 0
// }

export const MentorInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  username: z.string(),
  gender: genderSchema,
  socials: z.object({
    github: z.string().nullable(),
    facebook: z.string().nullable(),
    linkedin: z.string().nullable(),
    twitter: z.string().nullable(),
  }),
  organization: z.string(),
  dob: z.date(),
  profile_pic: z.string().nullable(),
});
