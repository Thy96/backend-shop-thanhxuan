import React, { ReactNode } from 'react';

interface ICard {
  children: ReactNode;
}

function Card({ children }: ICard) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

export default Card;
