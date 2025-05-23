import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const RowBorderedBox = ({ children }: Props) => {
  return (
    <span className="flex flex-col bg-orange-800/30   rounded-2xl m-2 py-3 w-full">
      {children}
    </span>
  );
};

const RowBorderedBoxRow = ({ children }: Props) => {
  return (
    <span className="border-t border-orange-500/20 px-4 py-2 text-xl">
      {children}
    </span>
  );
};

const RowBorderedBoxHeader = ({ children }: Props) => {
  return (
    <div className="flex items-center justify-between px-4 text-orange-500 py-2">
      {children}
    </div>
  );
};

export { RowBorderedBox, RowBorderedBoxRow, RowBorderedBoxHeader };
