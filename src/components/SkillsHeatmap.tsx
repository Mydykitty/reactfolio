import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { skills } from "../data/skills";

interface SkillData {
  subject: string;
  value: number;
  fullMark: number;
}

const SkillsHeatmap: React.FC = () => {
  const [data, setData] = useState<SkillData[]>([]);
  const [viewType, setViewType] = useState<"radar" | "bar">("radar");

  useEffect(() => {
    // 转换技能数据格式
    const chartData = skills.map((skill) => ({
      subject: skill.name,
      value: skill.level,
      fullMark: 100,
    }));
    setData(chartData);
  }, []);

  // 计算平均熟练度
  const averageLevel = Math.round(
    skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length,
  );

  // 最高技能
  const topSkill = skills.reduce(
    (max, skill) => (skill.level > max.level ? skill : max),
    skills[0],
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* 标题和统计 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔥 技能热力图
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("radar")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewType === "radar"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            雷达图
          </button>
          <button
            onClick={() => setViewType("bar")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewType === "bar"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            柱状图
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400">
            平均熟练度
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {averageLevel}%
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400">
            最强技能
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {topSkill.name}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            {topSkill.level}%
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === "radar" ? (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid
                stroke={
                  document.documentElement.classList.contains("dark")
                    ? "#374151"
                    : "#e5e7eb"
                }
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#4b5563",
                  fontSize: 12,
                }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{
                  fill: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#4b5563",
                  fontSize: 10,
                }}
              />
              <Radar
                name="技能熟练度"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark",
                  )
                    ? "#1f2937"
                    : "#ffffff",
                  borderColor: document.documentElement.classList.contains(
                    "dark",
                  )
                    ? "#374151"
                    : "#e5e7eb",
                  color: document.documentElement.classList.contains("dark")
                    ? "#ffffff"
                    : "#000000",
                }}
              />
            </RadarChart>
          ) : (
            // 🔴 真正的柱状图
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  document.documentElement.classList.contains("dark")
                    ? "#374151"
                    : "#e5e7eb"
                }
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{
                  fill: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#4b5563",
                  fontSize: 12,
                }}
              />
              <YAxis
                type="category"
                dataKey="subject"
                width={10}
                tick={{
                  fill: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#4b5563",
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark",
                  )
                    ? "#1f2937"
                    : "#ffffff",
                  borderColor: document.documentElement.classList.contains(
                    "dark",
                  )
                    ? "#374151"
                    : "#e5e7eb",
                  color: document.documentElement.classList.contains("dark")
                    ? "#ffffff"
                    : "#000000",
                }}
                formatter={(value: number | undefined) => {
                  if (value === undefined || value === null) {
                    return ["0%", "熟练度"]; // 或者返回 ["-", "熟练度"]
                  }
                  return [`${value}%`, "熟练度"];
                }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                background={{
                  fill: document.documentElement.classList.contains("dark")
                    ? "#374151"
                    : "#f3f4f6",
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 图例说明 */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>当前技能水平</span>
        </div>
        <div>• 满分100%</div>
      </div>
    </div>
  );
};

export default SkillsHeatmap;
