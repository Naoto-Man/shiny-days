'use client';

import Link from 'next/link';

export function BackHeader({ href, title }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Link
        href={href}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2f5] text-lg"
      >
        ←
      </Link>
      <h1 className="text-[22px] font-bold">{title}</h1>
    </div>
  );
}

export function Btn({ children, className = '', variant = 'primary', ...props }) {
  const base =
    'block w-full rounded-[10px] border-0 px-4 py-3.5 text-[15px] font-semibold cursor-pointer disabled:opacity-50';
  const variants = {
    primary: 'bg-[#4f6ef7] text-white hover:bg-[#3d5ce0]',
    secondary: 'bg-[#eef1ff] text-[#4f6ef7]',
    danger: 'bg-white text-red-600 border-[1.5px] border-red-600',
    deadline: 'bg-red-50 text-red-600 border-[1.5px] border-[#ffc9c9]',
    sm: 'w-auto rounded-lg px-4 py-2 text-[13px]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-[#444]">
      {children}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`mb-4 w-full rounded-[10px] border-[1.5px] border-[#dde1ea] bg-[#fafbfc] px-3.5 py-3 text-[15px] focus:border-[#4f6ef7] focus:bg-white focus:outline-none ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`mb-4 w-full rounded-[10px] border-[1.5px] border-[#dde1ea] bg-[#fafbfc] px-3.5 py-3 text-[15px] focus:border-[#4f6ef7] focus:bg-white focus:outline-none ${className}`}
      {...props}
    />
  );
}

export function MemoPreview({ text, onClick }) {
  if (!text) return null;
  const preview = text.length > 28 ? text.slice(0, 28) + '…' : text;
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 w-full truncate rounded-md border-l-[3px] border-[#c5cdf5] bg-[#f8f9fc] px-2 py-1.5 text-left text-[12px] text-[#777]"
    >
      📝 {preview}
    </button>
  );
}
