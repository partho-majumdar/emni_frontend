"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { InterestType, StudentPersonalInfoType } from "../types";

interface StudentData {
  student_id?: string;
  personalInfo?: StudentPersonalInfoType;
  interests?: InterestType[];
}

interface StudentDataContextType {
  studentData: StudentData | null;
  updateStudentInterests: (s_interests: InterestType[]) => void;
  updateStudentInfo: (s_info: StudentPersonalInfoType) => void;
  // updateStudentID: (s_id: string) => void;
}

const StudentDataContext = createContext<StudentDataContextType | null>(null);

export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // const getInitialState = (): StudentData | null => {
  //   if (typeof window !== "undefined") {
  //     const storedData = localStorage.getItem("studentData");
  //     return storedData ? JSON.parse(storedData) : null;
  //   }
  //   return null;
  // };

  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const updateStudentInterests = (s_interests: InterestType[]) => {
    const prev = studentData;
    if (prev) {
      prev.interests = s_interests;
      setStudentData({ ...prev });
      return;
    }
    setStudentData({
      interests: s_interests,
    });
  };

  const updateStudentInfo = (s_info: StudentPersonalInfoType) => {
    const prev = studentData;
    console.log("updating student info, before update ", prev);
    if (prev) {
      prev.personalInfo = s_info;
      setStudentData({ ...prev });
      console.log("updating student info 0");
      return;
    }
    console.log("updating student info 1");
    setStudentData({
      personalInfo: s_info,
    });
  };
  // const updateStudentID = (s_id: string) => {
  //   const prev = studentData;
  //   if (prev) {
  //     prev.student_id = s_id;
  //     setStudentData({ ...prev });
  //     return;
  //   }
  //   setStudentData({
  //     student_id: s_id,
  //   });
  // };

  // useEffect(() => {
  //   if (studentData !== null && typeof window !== "undefined") {
  //     localStorage.setItem("studentData", JSON.stringify(studentData));
  //   }
  // }, [studentData]);

  return (
    <StudentDataContext.Provider
      value={{
        studentData,
        updateStudentInterests,
        updateStudentInfo,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = (): StudentDataContextType => {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error("useStudentData must be used within a StudentDataProvider");
  }
  return context;
};
