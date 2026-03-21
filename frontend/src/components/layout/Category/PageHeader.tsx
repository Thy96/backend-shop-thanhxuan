import React, { ReactNode } from 'react';
import Link from 'next/link';

interface IPageHeader {
  title: String;
  action: ReactNode;
}

function PageHeader({ title, action }: IPageHeader) {
  return (
    <div
      className="grid grid-cols-2 items-center justify-between mb-6 flex-wrap
    gap-1"
    >
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

      {action}
    </div>
  );
}

export default PageHeader;
