import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const match = /language-(\w+)/.exec(className || "");
  const isDark = document.documentElement.classList.contains("dark");

  // 判断是否是行内代码
  const isInline = !match && String(children).includes("\n") === false;

  // 如果是行内代码，直接返回code标签
  if (isInline) {
    return <code className={className}>{children}</code>;
  }

  // 如果是代码块且有语言标记，使用语法高亮
  if (match) {
    return (
      <div className="relative group">
        <SyntaxHighlighter
          language={match[1]}
          style={isDark ? vscDarkPlus : vs}
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.9rem",
            padding: "1rem",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>

        {/* 复制按钮 */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
            alert("代码已复制到剪贴板");
          }}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          复制
        </button>
      </div>
    );
  }

  // 如果是代码块但没有语言标记，使用普通pre
  return (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
};

export default CodeBlock;
