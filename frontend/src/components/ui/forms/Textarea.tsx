'use client';
import React, { InputHTMLAttributes } from 'react';

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  classNames?: {
    label?: string;
    textarea?: string;
    error?: string;
  };
}

function Textarea({ label, error, classNames, ...props }: TextareaProps) {
  return (
    <div className="w-full mb-4">
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
      <textarea
        {...props}
        className={`bg-white w-full p-3 border border-gray-300 rounded-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition ${
          classNames?.textarea || ''
        }`}
      />
      {error && (
        <p className={`mt-1 text-sm text-red-500 ${classNames?.error || ''}`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Textarea;
