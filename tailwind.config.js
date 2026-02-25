/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ 确保是 class 模式
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 可以在这里扩展自定义颜色
      },
    },
  },
  plugins: [],
};
