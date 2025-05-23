import { z } from "zod";

export const genderSchema = z.enum(["Male", "Female"]);
//  API Response of Student Profile
// {
//   "user_id": "af5b78ae-1a9a-4fc5-82e6-eff1fed421bf",
//   "name": "New Student 6",
//   "email": "newstudent6@gmail.com",
//   "username": "newstudent6",
//   "gender": "Female",
//   "student_id": "2a4282ca-f919-4146-9942-f39228e98d1c",
//   "dob": "2020-06-08T18:00:00.000Z",
//   "graduation_year": 2079
// }

export const StudentInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  username: z.string(),
  gender: genderSchema,
  dob: z.date(),
  graduation_year: z.number(),
});
