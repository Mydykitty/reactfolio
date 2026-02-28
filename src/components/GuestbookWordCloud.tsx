import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { supabase } from "../lib/supabase";

interface WordData {
  text: string;
  value: number;
}

const GuestbookWordCloud: React.FC = () => {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [timeRange]);

  useEffect(() => {
    if (words.length > 0 && containerRef.current) {
      renderWordCloud();
    }
  }, [words]);

  const fetchMessages = async () => {
    setLoading(true);

    let query = supabase.from("messages").select("content");

    const now = new Date();
    if (timeRange === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      query = query.gte("created_at", weekAgo.toISOString());
    } else if (timeRange === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      query = query.gte("created_at", monthAgo.toISOString());
    }

    const { data } = await query;

    if (data && data.length > 0) {
      // 词频统计
      const wordCount: Record<string, number> = {};

      data.forEach((msg) => {
        // 按中文和英文标点分割
        const words = msg.content.split(
          /[\s，,。.！!？?；;：:、/\\（）()【】\[\]{}]+/,
        );
        words.forEach((word: string) => {
          const trimmed = word.trim();
          if (trimmed.length > 1) {
            // 只统计长度大于1的词
            wordCount[trimmed] = (wordCount[trimmed] || 0) + 1;
          }
        });
      });

      const wordList = Object.entries(wordCount)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50); // 取前50个词

      setWords(wordList);
    } else {
      setWords([]);
    }

    setLoading(false);
  };

  const renderWordCloud = () => {
    if (!containerRef.current || words.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // 清空容器
    container.innerHTML = "";

    // 计算字体大小范围
    const maxValue = Math.max(...words.map((w) => w.value));
    const minValue = Math.min(...words.map((w) => w.value));

    // 准备词云数据：根据词频计算字体大小 (20-80px)
    const wordData = words.map((w) => ({
      text: w.text,
      size:
        minValue === maxValue
          ? 40
          : 20 + ((w.value - minValue) / (maxValue - minValue)) * 60,
    }));

    // 创建词云布局
    const layout = cloud()
      .size([width, height])
      .words(wordData)
      .padding(3) // 词与词之间的间距
      .rotate(() => (Math.random() > 0.5 ? 0 : 30)) // 随机旋转0或30度
      .font("sans-serif")
      .fontSize((d) => d.size!)
      .on("end", draw);

    layout.start();

    // 绘制函数
    function draw(words: cloud.Word[]) {
      // 创建SVG
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // 添加词云文字
      svg
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("fill", (_d, i) => {
          // 使用 D3 的颜色方案
          const colors = [
            "#3b82f6",
            "#ef4444",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#ec4899",
            "#06b6d4",
            "#f97316",
          ];
          return colors[i % colors.length];
        })
        .style("opacity", 0.8)
        .style("cursor", "pointer")
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`,
        )
        .text((d) => d.text!)
        .on("mouseover", function () {
          d3.select(this)
            .style("opacity", 1)
            .style("font-size", (d) => `${(d as any).size * 1.1}px`);
        })
        .on("mouseout", function () {
          d3.select(this)
            .style("opacity", 0.8)
            .style("font-size", (d) => `${(d as any).size}px`);
        })
        .on("click", (_event, d) => {
          console.log("点击词:", d.text);
          // 可以添加点击搜索功能
          alert(`你点击了: ${d.text}`);
        });
    }
  };

  // 窗口大小变化时重新渲染
  useEffect(() => {
    const handleResize = () => {
      if (words.length > 0) {
        renderWordCloud();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [words]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* 标题和筛选 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          ☁️ 留言词云
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            近一周
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            近一月
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            全部
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      {words.length > 0 && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          共 {words.length} 个热门词，点击词可查看详情
        </div>
      )}

      {/* 词云容器 */}
      {words.length > 0 ? (
        <div
          ref={containerRef}
          className="w-full h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      ) : (
        <div className="h-[400px] flex items-center justify-center text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg">
          暂无留言数据
        </div>
      )}

      {/* 热门词列表 */}
      {words.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">热门词 TOP 10</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {words.slice(0, 10).map((word) => (
              <div
                key={word.text}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span className="font-medium">{word.text}</span>
                <span className="text-sm text-gray-500">{word.value}次</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestbookWordCloud;
