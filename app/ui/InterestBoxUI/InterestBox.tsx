"use client";
import { getInterestsListStudent } from "@/app/lib/fetchers/student";
import { InterestType } from "@/app/types";
import React, { useEffect, useState } from "react";
import AddInterestBtn from "../AddInterestBtn";
import {
  RowBorderedBox,
  RowBorderedBoxHeader,
  RowBorderedBoxRow,
} from "../RowBorderedBox";
import { getInterestsListMentor } from "@/app/lib/fetchers/mentor";

type Props = {
  role: "mentor" | "student";
};

const InterestBox = ({ role }: Props) => {
  const [interestList, setInterestList] = useState<InterestType[]>([]);
  const maxInterests = 10;
  useEffect(() => {
    const fn = async () => {
      const data: InterestType[] =
        role === "student"
          ? await getInterestsListStudent()
          : await getInterestsListMentor();
      setInterestList(data);
    };
    fn();
  }, []);
  return (
    <RowBorderedBox>
      <RowBorderedBoxHeader>
        <span className="text-2xl font-semibold py-2">Interests</span>
        <span className="flex items-center text-xl gap-x-2">
          {interestList.length}/{maxInterests}
          <AddInterestBtn
            SelectCount={maxInterests}
            updateInterestList={(newInterstList: InterestType[]) => {
              setInterestList(newInterstList);
            }}
            value={interestList}
            role={role}
          />
        </span>
      </RowBorderedBoxHeader>
      {interestList.map((item) => {
        return (
          <RowBorderedBoxRow key={item.interest_name}>
            {item.interest_name}
          </RowBorderedBoxRow>
        );
      })}
    </RowBorderedBox>
  );
};

export default InterestBox;
