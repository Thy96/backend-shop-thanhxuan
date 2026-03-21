import React, { ReactNode } from 'react';

interface ITablelayout {
  isEmpty: boolean;
  emptyText?: string;
  thead: ReactNode;
  tbody: ReactNode;
}

function Tablelayout({
  isEmpty,
  emptyText = 'Không có danh mục nào',
  thead,
  tbody,
}: ITablelayout) {
  if (isEmpty) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">{emptyText}</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>{thead}</thead>
        <tbody>{tbody}</tbody>
      </table>
    </div>
  );
}

export default Tablelayout;
