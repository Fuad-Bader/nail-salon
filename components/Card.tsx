"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
