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

export function EditButton({
  children = 'Sửa',
  className,
  type = 'button',
  ...props
}: IButton) {
  return (
    <button
      type={type}
      className={clsx(
        'bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow-sm transition block text-center cursor-pointer text-sm w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DeleteButton({
  children = 'Xóa',
  className,
  type = 'button',
  ...props
}: IButton) {
  return (
    <button
      type={type}
      className={clsx(
        'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded transition text-sm w-full cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
