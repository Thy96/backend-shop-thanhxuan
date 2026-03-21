'use client';
import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: ReactNode;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
    error?: string;
  };
  note?: ReactNode;
}

function Input({ label, error, classNames, note, ...props }: InputProps) {
  return (
    <div className={`w-full mb-4 ${classNames?.wrapper ?? ''}`}>
      {label && (
        <label
          htmlFor={props.id}
          className={`block mb-1 text-lg font-medium text-gray-700 ${
            classNames?.label || ''
          }`}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition bg-white ${
          classNames?.input || ''
        } ${error ? 'border-red-500 focus:ring-red-400' : ''}`}
      />
      {note}
      {error && (
        <p className={`mt-1 text-sm text-red-500 ${classNames?.error || ''}`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
