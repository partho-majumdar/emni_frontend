import { randomUUID } from "crypto";
import {
  GroupSessionInfoType,
  GroupSessionParticipantInfo,
  MentorInfoType,
  MentorSuggestionType,
  SessionType,
} from "../types";

export const FakeStudentInfo = {
  name: "S Rafiul Hasan",
  email: "rafiulhasan803@gmail.com",
  username: "rafidoth",
  gender: "Female",
  dob: "2000-01-01T00:00:00.000Z",
  graduation_year: 2079,
  image_link: "",
};

export const FakeMentorInfo: MentorInfoType = {
  name: "Adiba Ibnat",
  email: "rafiulhasan803@gmail.com",
  username: "rafidoth",
  gender: "Male",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  grad_year: 2027,
  socials: {
    github: "github.com/rafidoth",
    facebook: "",
    linkedin: "",
    twitter: "",
  },
  image_link: "",
  bio: "Golang | JS | AWS | Scalable System Development ",
};

// export const FakeMentorListBasedOnStudentInterest = [
//   {
//     mentorId: "fakeMentor1",
//     name: "S Rafiul Hasan",
//     organization: "UIU",
//     profile_pic:
//       "https://avatars.githubusercontent.com/u/67283985?s=400&u=785ba4e71821a24fee9df89190cbfab208e72dd3&v=4",
//     level: "Pathfinder",
//   },
// ];
export const FakeMentorList: MentorSuggestionType[] = [
  {
    mentorId: "fakeMentorId",
    name: "John Doe",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=8",
    level: "beginner guide",
    bio: "Java | SWE Intern at XYZ | Hackathon Winner",
    sessions_taken: 41,
    review_count: 25,
  },
  {
    mentorId: "fakeMentorId",
    name: "Jane Smith",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=7",
    level: "uplifter",
    bio: "Python | Data Scientist | AI Competition Finalist",
    sessions_taken: 32,
    review_count: 18,
  },
  {
    mentorId: "fakeMentorId",
    name: "Alice Johnson",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=1",
    level: "pathfinder",
    bio: "Full Stack Developer | Coding Olympiad Champion",
    sessions_taken: 50,
    review_count: 30,
  },
  {
    mentorId: "fakeMentorId",
    name: "Bob Brown",
    organization: "CyberTech Solutions",
    profile_pic: "https://i.pravatar.cc/300?img=2",
    level: "illuminator",
    bio: "Cybersecurity Expert | CTF Winner",
    sessions_taken: 28,
    review_count: 15,
  },
  {
    mentorId: "fakeMentorId",
    name: "Charlie Davis",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=3",
    level: "trailblazer",
    bio: "Blockchain Developer | Hackathon Runner-up",
    sessions_taken: 35,
    review_count: 20,
  },
  {
    mentorId: "fakeMentorId",
    name: "Diana Evans",
    organization: "Creative Design Studio",
    profile_pic: "https://i.pravatar.cc/300?img=4",
    level: "master of art",
    bio: "UI/UX Designer | Design Competition Winner",
    sessions_taken: 40,
    review_count: 22,
  },
  {
    mentorId: "fakeMentorId",
    name: "Ethan Foster",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=5",
    level: "grandmaster",
    bio: "AI Researcher | Innovation Award Winner",
    sessions_taken: 60,
    review_count: 35,
  },
  {
    mentorId: "fakeMentorId",
    name: "Fiona Green",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=6",
    level: "beginner guide",
    bio: "Frontend Developer | Web Design Contest Finalist",
    sessions_taken: 25,
    review_count: 12,
  },
  {
    mentorId: "fakeMentorId",
    name: "George Harris",
    organization: "Data Insights Inc.",
    profile_pic: "https://i.pravatar.cc/300?img=9",
    level: "uplifter",
    bio: "Data Analyst | Data Science Hackathon Winner",
    sessions_taken: 38,
    review_count: 19,
  },
  {
    mentorId: "fakeMentorId",
    name: "Hannah White",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=10",
    level: "pathfinder",
    bio: "Mobile App Developer | App Challenge Winner",
    sessions_taken: 45,
    review_count: 28,
  },
  {
    mentorId: "fakeMentorId",
    name: "Ian King",
    organization: "Cloud Innovators",
    profile_pic: "https://i.pravatar.cc/300?img=11",
    level: "illuminator",
    bio: "Cloud Engineer | Cloud Innovation Award Winner",
    sessions_taken: 30,
    review_count: 16,
  },
  {
    mentorId: "fakeMentorId",
    name: "Jessica Lee",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=12",
    level: "trailblazer",
    bio: "Machine Learning Engineer | AI Hackathon Finalist",
    sessions_taken: 42,
    review_count: 24,
  },
  {
    mentorId: "fakeMentorId",
    name: "Kevin Martinez",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=13",
    level: "master of art",
    bio: "Game Developer | Game Jam Winner",
    sessions_taken: 36,
    review_count: 21,
  },
  {
    mentorId: "fakeMentorId",
    name: "Laura Nelson",
    organization: "United International University",
    profile_pic: "https://i.pravatar.cc/300?img=14",
    level: "grandmaster",
    bio: "Robotics Expert | Robotics Competition Winner",
    sessions_taken: 55,
    review_count: 33,
  },
  {
    mentorId: "fakeMentorId",
    name: "Michael Scott",
    organization: "Marketing Gurus Ltd.",
    profile_pic: "https://i.pravatar.cc/300?img=15",
    level: "beginner guide",
    bio: "Marketing Specialist | Marketing Challenge Winner",
    sessions_taken: 20,
    review_count: 10,
  },
];

export const FakeGetSessionsMentor = {
  sessionId: "fake-session-id",
  mentorId: "fakeMentorId",
  title: "SPL Midterm Question Solve Session",
  DurationInMinutes: 120,
  session_medium: ["Online", "Offline"],
  Description: `
    - Previous two trimester question solving live
    - 1 set Practice Question with solution
  `,
  Price: 500,
};
export const getFakeSessionInfo = () => {
  const sessionTypes = [
    "Course Topic Tution",
    "Project Help",
    "Career Guidance",
    "Competition Prep",
    "Productivity",
    "ECA",
  ];

  const titles = [
    "Data Structures and Algorithms",
    "Web Development Fundamentals",
    "Machine Learning Basics",
    "Mobile App Development",
    "Cloud Computing Essentials",
    "Software Engineering Principles",
    "Database Management Systems",
    "Network Security Fundamentals",
    "UI/UX Design Workshop",
    "Programming with Python",
  ];

  const descriptions = [
    "In-depth coverage of core concepts with practical examples",
    "Previous question solving with detailed explanations",
    "Interactive session with hands-on practice",
    "Comprehensive guide with real-world applications",
    "One-on-one mentoring with personalized feedback",
  ];

  const mediums = [["Online"], ["Offline"], ["Online", "Offline"]];

  return {
    sessionId: randomUUID(),
    mentorId: "fakeMentorId",
    type: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    DurationInMinutes: Math.floor(Math.random() * 120) + 60, // Random duration between 60-180 minutes
    session_medium: mediums[Math.floor(Math.random() * mediums.length)],
    Description: descriptions[Math.floor(Math.random() * descriptions.length)],
    Price: Math.floor(Math.random() * 1000) + 200, // Random price between 200-1200
  };
};

export const getFakeSessionsForStudent = (
  title: string,
  type: SessionType,
  description?: string
) => {
  return {
    sessionId: randomUUID(),
    mentorId: "fakeMentorId",
    mentorName: "S Rafiul Hasan",
    mentorImageLink:
      "https://avatars.githubusercontent.com/u/67283985?s=400&u=785ba4e71821a24fee9df89190cbfab208e72dd3&v=4",
    type: type,
    title: title,
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: description
      ? description
      : `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  };
};
export const fakeSingleSessionInfo = {
  sessionId: "fakeSessionId",
  mentorId: "fakeMentorId",
  mentorName: "S Rafiul Hasan",
  mentorImageLink:
    "https://avatars.githubusercontent.com/u/67283985?s=400&u=785ba4e71821a24fee9df89190cbfab208e72dd3&v=4",
  type: "Course Topic Tution",
  title: "Physics Mid term preparation",
  DurationInMinutes: 120,
  session_medium: ["Online", "Offline"],
  Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
  Price: 500,
};

export const fakeSessionsSuggestionStudentDashboard = [
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentorId",
    mentorName: "S Rafiul Hasan",
    mentorImageLink:
      "https://avatars.githubusercontent.com/u/67283985?s=400&u=785ba4e71821a24fee9df89190cbfab208e72dd3&v=4",
    type: "Course Topic Tution",
    title: "Physics Mid term preparation",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor1",
    mentorName: "John Doe",
    mentorImageLink: "https://i.pravatar.cc/300?img=1",
    type: "Course Topic Tution",
    title: "OOP Mid Term Preparation",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor2",
    mentorName: "Jane Smith",
    mentorImageLink: "https://i.pravatar.cc/300?img=2",
    type: "Project Help",
    title: "Data Structures Project Help",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor3",
    mentorName: "Alice Johnson",
    mentorImageLink: "https://i.pravatar.cc/300?img=3",
    type: "Career Guidance",
    title: "Career Guidance for Freshers",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor4",
    mentorName: "Bob Brown",
    mentorImageLink: "https://i.pravatar.cc/300?img=4",
    type: "Competition Prep",
    title: "Blockchain Olympiad Preparation",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor5",
    mentorName: "Charlie Davis",
    mentorImageLink: "https://i.pravatar.cc/300?img=5",
    type: "Productivity",
    title: "Time Management Workshop",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor6",
    mentorName: "Diana Evans",
    mentorImageLink: "https://i.pravatar.cc/300?img=6",
    type: "ECA",
    title: "ECA Club Leadership Training",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor7",
    mentorName: "Ethan Foster",
    mentorImageLink: "https://i.pravatar.cc/300?img=7",
    type: "Course Topic Tution",
    title: "SQL Crash Course",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor8",
    mentorName: "Fiona Green",
    mentorImageLink: "https://i.pravatar.cc/300?img=8",
    type: "Career Guidance",
    title: "AI Research Guidance",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor9",
    mentorName: "George Harris",
    mentorImageLink: "https://i.pravatar.cc/300?img=9",
    type: "Competition Prep",
    title: "Hackathon Preparation",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
  {
    sessionId: "fakeSessionId",
    mentorId: "fakeMentor10",
    mentorName: "Hannah White",
    mentorImageLink: "https://i.pravatar.cc/300?img=10",
    type: "Productivity",
    title: "Stress Management Techniques",
    DurationInMinutes: 120,
    session_medium: ["Online", "Offline"],
    Description: `Previous two trimester question solving live and 1 set Practice Question with solution`,
    Price: 500,
  },
];
export const mentorAvailableAt = [
  {
    id: "fakeId1",
    start: new Date("2025-03-25T09:43:44.000Z"),
    end: new Date("2025-03-25T11:15:44.000Z"),
    booked: false,
  },
  {
    id: "fakeId2",
    start: new Date("2025-03-28T10:20:44.000Z"),
    end: new Date("2025-03-28T12:00:44.000Z"),
    booked: false,
  },
  {
    id: "fakeId3",
    start: new Date("2025-03-26T08:00:44.000Z"),
    end: new Date("2025-03-26T10:00:44.000Z"),
    booked: false,
  },
  {
    id: "fakeId4",
    start: new Date("2025-03-25T12:30:00.000Z"),
    end: new Date("2025-03-25T14:00:00.000Z"),
    booked: false,
  },
  {
    id: "fakeId5",
    start: new Date("2025-03-28T14:30:00.000Z"),
    end: new Date("2025-03-28T16:00:00.000Z"),
    booked: false,
  },
  {
    id: "fakeId6",
    start: new Date("2025-03-26T11:00:00.000Z"),
    end: new Date("2025-03-26T12:30:00.000Z"),
    booked: false,
  },
  {
    id: "fakeId7",
    start: new Date("2025-03-25T15:00:00.000Z"),
    end: new Date("2025-03-25T17:30:00.000Z"),
    booked: false,
  },
  {
    id: "fakeid8",
    start: new Date("2025-03-28T16:30:00.000Z"),
    end: new Date("2025-03-28T19:00:00.000Z"),
    booked: false,
  },
  {
    id: "fakeid9",
    start: new Date("2025-03-26T13:00:00.000Z"),
    end: new Date("2025-03-26T15:30:00.000Z"),
    booked: false,
  },
];
export const fakeSingleMentorAvailability = {
  id: "fakeid9",
  start: new Date("2025-03-26T13:00:00.000Z"),
  end: new Date("2025-03-26T15:30:00.000Z"),
  booked: false,
};

export const fakeAvailabilities = [
  {
    id: 1,
    start: new Date("2025-04-25T09:43:44.000Z"),
    end: new Date("2025-04-25T11:15:44.000Z"),
    booked: "fakeSessionId",
  },
  {
    id: 2,
    start: new Date("2025-04-28T10:20:44.000Z"),
    end: new Date("2025-04-28T12:00:44.000Z"),
    booked: "",
  },
  {
    id: 3,
    start: new Date("2025-04-26T08:00:44.000Z"),
    end: new Date("2025-04-26T10:00:44.000Z"),
    booked: "",
  },
];

// name: z.string(),
// email: z.string(),
// username: z.string(),
// gender: genderSchema,
// dob: z.date(),
// graduation_year: z.number(),

export const single_student_interests = [
  {
    interest_id: "4ea784ee-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Artificial Intelligence & Deep Learning",
  },
  {
    interest_id: "4ea7a33a-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Animation & Motion Graphics",
  },
  {
    interest_id: "4ea7a453-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Aerospace & Automotive Engineering",
  },
];

export const All_Interests = [
  {
    interest_id: "4ea7a453-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Aerospace & Automotive Engineering",
  },
  {
    interest_id: "4ea7a33a-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Animation & Motion Graphics",
  },
  {
    interest_id: "4ea784ee-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Artificial Intelligence & Deep Learning",
  },
  {
    interest_id: "4ea78379-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Backend Development",
  },
  {
    interest_id: "4ea7a10d-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Biotechnology & Biotech Startups",
  },
  {
    interest_id: "4ea78536-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Blockchain & Cryptocurrency",
  },
  {
    interest_id: "4ea7a085-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Business Analytics",
  },
  {
    interest_id: "4ea7a1eb-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Career Switching & Growth Strategy",
  },
  {
    interest_id: "4ea78611-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Competitive Programming & Algorithms",
  },
  {
    interest_id: "4ea7a2d1-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Conflict Resolution & Negotiation",
  },
  {
    interest_id: "4ea7a3bd-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Copywriting & Content Strategy",
  },
  {
    interest_id: "4ea78515-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Cybersecurity & Ethical Hacking",
  },
  {
    interest_id: "4ea784c4-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Data Analysis & Visualization",
  },
  {
    interest_id: "4ea784a0-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Data Science & Machine Learning",
  },
  {
    interest_id: "4ea78582-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "DevOps & Cloud Computing",
  },
  {
    interest_id: "4ea7a03d-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Digital Marketing & SEO",
  },
  {
    interest_id: "4ea79f91-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "E-commerce & Dropshipping",
  },
  {
    interest_id: "4ea7a152-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Economics & Business Analytics",
  },
  {
    interest_id: "4ea785ef-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Embedded Systems & Hardware Programming",
  },
  {
    interest_id: "4ea7a0c7-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Engineering",
  },
  {
    interest_id: "4ea7a560-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Ethical Hacking & Digital Forensics",
  },
  {
    interest_id: "4ea79f13-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Finance & Investment",
  },
  {
    interest_id: "4ea7a4f9-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Fitness, Health & Nutrition",
  },
  {
    interest_id: "4ea7a26f-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Freelancing & Remote Work",
  },
  {
    interest_id: "4ea75b70-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Frontend Development",
  },
  {
    interest_id: "4ea7841b-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Full Stack Development",
  },
  {
    interest_id: "4ea7a35a-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Game Art & Game Design",
  },
  {
    interest_id: "4ea78477-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Game Development",
  },
  {
    interest_id: "4ea7a2f4-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Graphic Design",
  },
  {
    interest_id: "4ea79ffa-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Growth Hacking",
  },
  {
    interest_id: "4ea7855d-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Internet of Things (IoT)",
  },
  {
    interest_id: "4ea7a4b9-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Language Learning",
  },
  {
    interest_id: "4ea7a12f-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Law & Legal Studies",
  },
  {
    interest_id: "4ea7a062-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Leadership & Team Management",
  },
  {
    interest_id: "4ea7a51e-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Life Coaching & Personal Development",
  },
  {
    interest_id: "4ea79fba-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Marketing & Branding",
  },
  {
    interest_id: "4ea7a171-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Mathematics & Statistics",
  },
  {
    interest_id: "4ea7a495-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Mechanical CAD & 3D Printing",
  },
  {
    interest_id: "4ea7a0eb-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Medical & Healthcare",
  },
  {
    interest_id: "4ea7a53f-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Meditation & Mindfulness",
  },
  {
    interest_id: "4ea78451-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Mobile App Development",
  },
  {
    interest_id: "4ea7a4da-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Music Production & Audio Engineering",
  },
  {
    interest_id: "4ea7a28f-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Personal Branding & Networking",
  },
  {
    interest_id: "4ea7a24f-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Personal Finance & Wealth Management",
  },
  {
    interest_id: "4ea7a37a-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Photography & Cinematography",
  },
  {
    interest_id: "4ea7a3de-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Podcasting & Voiceover",
  },
  {
    interest_id: "4ea7a01c-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Product Management",
  },
  {
    interest_id: "4ea7a190-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Psychology & Mental Health",
  },
  {
    interest_id: "4ea7a20c-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Public Speaking & Communication Skills",
  },
  {
    interest_id: "4ea7a41e-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Renewable Energy & Sustainability",
  },
  {
    interest_id: "4ea7a1b0-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Resume Building & Interview Preparation",
  },
  {
    interest_id: "4ea7a3fd-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Robotics & Automation",
  },
  {
    interest_id: "4ea79fdb-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Sales & Negotiation",
  },
  {
    interest_id: "4ea7a0a6-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Scientific Research & Publishing",
  },
  {
    interest_id: "4ea7a473-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Semiconductor & Chip Design",
  },
  {
    interest_id: "4ea785cd-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Software Testing & Quality Assurance",
  },
  {
    interest_id: "4ea78631-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Startup & Business Strategy",
  },
  {
    interest_id: "4ea7a22e-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Time Management & Productivity",
  },
  {
    interest_id: "4ea785a7-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "UI/UX Design & Product Design",
  },
  {
    interest_id: "4ea79f6c-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Venture Capital & Fundraising",
  },
  {
    interest_id: "4ea7a318-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Video Editing & Content Creation",
  },
  {
    interest_id: "4ea71a83-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Web Development",
  },
  {
    interest_id: "4ea7a2af-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Workplace Ethics & Professionalism",
  },
  {
    interest_id: "4ea7a399-fd1a-11ef-b7b8-55e0634d59d9",
    interest_name: "Writing & Blogging",
  },
];
export const fakeGroupSessionInfos: GroupSessionInfoType[] = [
  {
    id: "fakeGSession",
    title: "Golang Zero to One",
    description: "Group session description",
    durationInMinutes: 120,
    startTime: new Date(),
    mentor: {
      id: "fakeMentorId",
      name: "S Rafiul Hasan",
      photoLink:
        "https://avatars.githubusercontent.com/u/67283985?s=400&u=785ba4e71821a24fee9df89190cbfab208e72dd3&v=4",
    },
    participants: {
      current: 37,
      max: 40,
    },
    previewParticipants: [
      { id: "p1", name: "Alice", photoLink: "https://i.pravatar.cc/150?img=5" },
      { id: "p2", name: "Bob", photoLink: "https://i.pravatar.cc/150?img=6" },
      {
        id: "p3",
        name: "Charlie",
        photoLink: "https://i.pravatar.cc/150?img=7",
      },
      { id: "p4", name: "David", photoLink: "https://i.pravatar.cc/150?img=8" },
      { id: "p5", name: "Eve", photoLink: "https://i.pravatar.cc/150?img=9" },
    ],
  },
  {
    id: "fakeGSession2",
    title: "React for Beginners",
    description: "Learn the basics of React.js",
    durationInMinutes: 90,
    startTime: new Date(),
    mentor: {
      id: "fakeMentorId2",
      name: "John Doe",
      photoLink: "https://i.pravatar.cc/150?img=1",
    },
    participants: {
      current: 25,
      max: 30,
    },
    previewParticipants: [
      {
        id: "p6",
        name: "Frank",
        photoLink: "https://i.pravatar.cc/150?img=10",
      },
      {
        id: "p7",
        name: "Grace",
        photoLink: "https://i.pravatar.cc/150?img=11",
      },
      {
        id: "p8",
        name: "Henry",
        photoLink: "https://i.pravatar.cc/150?img=12",
      },
      {
        id: "p9",
        name: "Isabel",
        photoLink: "https://i.pravatar.cc/150?img=13",
      },
      {
        id: "p10",
        name: "Jack",
        photoLink: "https://i.pravatar.cc/150?img=14",
      },
    ],
  },
  {
    id: "fakeGSession3",
    title: "Advanced TypeScript",
    description: "Deep dive into TypeScript features",
    durationInMinutes: 150,
    startTime: new Date(),
    mentor: {
      id: "fakeMentorId3",
      name: "Jane Smith",
      photoLink: "https://i.pravatar.cc/150?img=2",
    },
    participants: {
      current: 18,
      max: 20,
    },
    previewParticipants: [
      {
        id: "p11",
        name: "Kate",
        photoLink: "https://i.pravatar.cc/150?img=15",
      },
      { id: "p12", name: "Leo", photoLink: "https://i.pravatar.cc/150?img=16" },
      { id: "p13", name: "Mia", photoLink: "https://i.pravatar.cc/150?img=17" },
      {
        id: "p14",
        name: "Noah",
        photoLink: "https://i.pravatar.cc/150?img=18",
      },
      {
        id: "p15",
        name: "Olivia",
        photoLink: "https://i.pravatar.cc/150?img=19",
      },
    ],
  },
  {
    id: "fakeGSession4",
    title: "Python for Data Science",
    description: "Explore Python libraries for data analysis",
    durationInMinutes: 120,
    startTime: new Date(),
    mentor: {
      id: "fakeMentorId4",
      name: "Alice Johnson",
      photoLink: "https://i.pravatar.cc/150?img=3",
    },
    participants: {
      current: 35,
      max: 40,
    },
    previewParticipants: [
      {
        id: "p16",
        name: "Paul",
        photoLink: "https://i.pravatar.cc/150?img=20",
      },
      {
        id: "p17",
        name: "Quinn",
        photoLink: "https://i.pravatar.cc/150?img=21",
      },
      {
        id: "p18",
        name: "Rachel",
        photoLink: "https://i.pravatar.cc/150?img=22",
      },
      {
        id: "p19",
        name: "Steve",
        photoLink: "https://i.pravatar.cc/150?img=23",
      },
      {
        id: "p20",
        name: "Tina",
        photoLink: "https://i.pravatar.cc/150?img=24",
      },
    ],
  },
  {
    id: "fakeGSession5",
    title: "Introduction to Machine Learning",
    description: "Understand the basics of ML algorithms",
    durationInMinutes: 180,
    startTime: new Date(),
    mentor: {
      id: "fakeMentorId5",
      name: "Bob Brown",
      photoLink: "https://i.pravatar.cc/150?img=4",
    },
    participants: {
      current: 20,
      max: 25,
    },
    previewParticipants: [
      { id: "p21", name: "Uma", photoLink: "https://i.pravatar.cc/150?img=25" },
      {
        id: "p22",
        name: "Victor",
        photoLink: "https://i.pravatar.cc/150?img=26",
      },
      {
        id: "p23",
        name: "Wendy",
        photoLink: "https://i.pravatar.cc/150?img=27",
      },
      {
        id: "p24",
        name: "Xander",
        photoLink: "https://i.pravatar.cc/150?img=28",
      },
      {
        id: "p25",
        name: "Yvonne",
        photoLink: "https://i.pravatar.cc/150?img=29",
      },
    ],
  },
];

export const fakeGroupSessionParticipants: GroupSessionParticipantInfo[] = [
  {
    id: "participant1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    photoLink: "https://i.pravatar.cc/150?img=10",
    joinedAt: new Date("2025-03-25T14:30:00Z").toISOString(),
    status: "registered",
  },
  {
    id: "participant2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    photoLink: "https://i.pravatar.cc/150?img=11",
    joinedAt: new Date("2025-03-26T09:15:00Z").toISOString(),
    status: "completed",
  },
  {
    id: "participant3",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    photoLink: "https://i.pravatar.cc/150?img=12",
    joinedAt: new Date("2025-03-27T16:45:00Z").toISOString(),
    status: "cancelled",
  },
  {
    id: "participant4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    photoLink: "https://i.pravatar.cc/150?img=13",
    joinedAt: new Date("2025-03-28T08:00:00Z").toISOString(),
    status: "registered",
  },
  {
    id: "participant5",
    name: "Emma Davis",
    email: "emma.davis@example.com",
    photoLink: "https://i.pravatar.cc/150?img=14",
    joinedAt: new Date("2025-03-28T10:30:00Z").toISOString(),
    status: "waiting",
  },
];

export const fakeBookedSessions = [
  {
    session_type: "1:1",
    sessionId: "fakeSessionId",
    start: new Date("2025-04-25T09:43:44.000Z"),
    end: new Date("2025-04-25T11:15:44.000Z"),
    medium: "online",
  },
  {
    session_type: "Group",
    sessionId: "fakeSessionId",
    start: new Date("2025-04-26T14:00:00.000Z"),
    end: new Date("2025-04-26T15:00:00.000Z"), // 1 hour
    medium: "offline",
  },
  {
    session_type: "1:1",
    sessionId: "fakeSessionId",
    start: new Date("2025-04-27T10:30:00.000Z"),
    end: new Date("2025-04-27T12:30:00.000Z"), // 2 hours
    medium: "online",
  },
  {
    session_type: "Group",
    sessionId: "fakeSessionId",
    start: new Date("2025-04-28T16:00:00.000Z"),
    end: new Date("2025-04-28T17:30:00.000Z"), // 1.5 hours
    medium: "offline",
  },
  {
    session_type: "1:1",
    sessionId: "fakeSessionId",
    start: new Date("2025-04-29T09:00:00.000Z"),
    end: new Date("2025-04-29T09:30:00.000Z"), // 30 mins
    medium: "online",
  },
  {
    session_type: "Group",
    sessionId: "fakeSessionId",
    start: new Date("2025-03-30T13:15:00.000Z"),
    end: new Date("2025-03-30T15:45:00.000Z"), // 2.5 hours
    medium: "offline",
  },
  {
    session_type: "1:1",
    sessionId: "fakeSessionId",
    start: new Date("2025-04-24T11:00:00.000Z"),
    end: new Date("2025-04-24T12:00:00.000Z"), // 1 hour
    medium: "online",
  },
];
