import type { FC, ButtonHTMLAttributes } from "react";

const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button
    {...props}
    className="rounded border border-transparent px-4 py-2 font-medium cursor-pointer transition-colors duration-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
  />
);

export default Button;
