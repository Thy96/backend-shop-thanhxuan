import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  name?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  hideOption?: boolean;
  label?: string;
  className?: string;
  selectClassName?: string;
}

function Select({
  className,
  selectClassName,
  name,
  value,
  onChange,
  options,
  label,
  hideOption = false,
  ...props
}: SelectProps) {
  return (
    <div className={`mb-4 ${className ?? ''}`}>
      {label && (
        <label className="block mb-1 text-lg font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`bg-white w-full p-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition appearance-none cursor-pointer ${selectClassName ?? ''}`}
          name={name}
          value={value}
          onChange={onChange}
          {...props}
        >
          {!hideOption && <option value="">-- Chọn --</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export default Select;
