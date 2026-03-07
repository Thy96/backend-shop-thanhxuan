import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  type: 'button' | 'reset' | 'submit';
}

function Button({ children, className, type = 'button', ...props }: IButton) {
  return (
    <button
      type={type}
      className={clsx(
        'bg-blue-600 text-white px-4 py-2 rounded w-full cursor-pointer hover:bg-blue-700 duration-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
