import React, { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const BlogTOC: React.FC<{ content: string }> = ({ content }) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);

  useEffect(() => {
    const lines = content.split("\n");
    const extracted: TOCItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/\s+/g, "-");
        extracted.push({ id, text, level });
      }
    });

    setHeadings(extracted);
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sticky top-4">
      <h4 className="font-bold mb-3">📖 目录</h4>
      <nav>
        {headings.map((heading, index) => (
          <a
            key={index}
            href={`#${heading.id}`}
            className="block text-sm hover:text-blue-500 transition-colors mb-1"
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default BlogTOC;
