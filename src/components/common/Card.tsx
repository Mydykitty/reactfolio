import type { FC, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

const Card: FC<CardProps> = ({ children }) => (
  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow mb-4">
    {children}
  </div>
);

export default Card;
