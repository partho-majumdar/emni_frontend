"use client";
import { cn } from "@/lib/utils";
import React, { ReactElement } from "react";
import { smooth_hover } from "@/app/ui/CustomStyles";
import Link from "next/link";

type Props = {
  TogglerElements: {
    name: string;
    icon: ReactElement;
    url: string;
  }[];
  selected: string;
  setSelected: (name: string) => void;
};

const Toggler = ({ TogglerElements, selected, setSelected }: Props) => {
  return (
    <div className="flex gap-x-2 justify-evenly h-[70px] items-center px-2">
      {TogglerElements.map((el) => {
        return (
          <Link
            key={el.name}
            onClick={() => setSelected(el.name)}
            href={el.url}
            className={cn(
              "cursor-pointer w-full flex justify-center rounded-xl",
              "py-2",
              selected !== el.name
                ? "hover:bg-orange-500/30 hover:text-orange-500"
                : "bg-orange-500/30 text-orange-500",
              smooth_hover
            )}
          >
            {el.icon}
          </Link>
        );
      })}
    </div>
  );
};

export default Toggler;
