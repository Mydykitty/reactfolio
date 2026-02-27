import React, { useState, useEffect } from "react";
import { getSourceStats } from "../../utils/visitLogger"; // 导入工具函数
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SourceStats {
  total: number;
  direct: number;
  search: number;
  social: number;
  external: number;
  utm: {
    google: number;
    facebook: number;
    twitter: number;
    github: number;
    other: number;
  };
  pages: Record<string, number>;
  daily: Record<string, number>;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const SourceAnalysis: React.FC = () => {
  const [stats, setStats] = useState<SourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [view, setView] = useState<"overview" | "utm" | "pages">("overview");

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getSourceStats(days); // 直接使用工具函数
    setStats(data as SourceStats);
    setLoading(false);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12">暂无数据</div>;
  }

  // 准备图表数据
  const sourceData = [
    { name: "直接访问", value: stats.direct },
    { name: "搜索引擎", value: stats.search },
    { name: "社交媒体", value: stats.social },
    { name: "外部链接", value: stats.external },
  ].filter((item) => item.value > 0);

  const utmData = [
    { name: "Google", value: stats.utm.google },
    { name: "Facebook", value: stats.utm.facebook },
    { name: "Twitter", value: stats.utm.twitter },
    { name: "GitHub", value: stats.utm.github },
    { name: "其他", value: stats.utm.other },
  ].filter((item) => item.value > 0);

  const pageData = Object.entries(stats.pages)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

  const dailyData = Object.entries(stats.daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部和统计卡片保持不变 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">访问来源分析</h1>
          <div className="flex gap-2">
            <button
                onClick={() => setDays(7)}
                className={`px-3 py-1 rounded-lg text-sm ${
                    days === 7 ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
            >
              近7天
            </button>
            <button
                onClick={() => setDays(30)}
                className={`px-3 py-1 rounded-lg text-sm ${
                    days === 30 ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
            >
              近30天
            </button>
            <button
                onClick={() => setDays(90)}
                className={`px-3 py-1 rounded-lg text-sm ${
                    days === 90 ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
            >
              近90天
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">总访问量</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">直接访问</div>
            <div className="text-3xl font-bold text-blue-600">{stats.direct}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">搜索引擎</div>
            <div className="text-3xl font-bold text-green-600">{stats.search}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">社交媒体</div>
            <div className="text-3xl font-bold text-purple-600">{stats.social}</div>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="flex gap-2 mb-6">
          <button
              onClick={() => setView("overview")}
              className={`px-4 py-2 rounded-lg ${
                  view === "overview" ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
          >
            来源概览
          </button>
          <button
              onClick={() => setView("utm")}
              className={`px-4 py-2 rounded-lg ${
                  view === "utm" ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
          >
            UTM分析
          </button>
          <button
              onClick={() => setView("pages")}
              className={`px-4 py-2 rounded-lg ${
                  view === "pages" ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
          >
            热门页面
          </button>
        </div>

        {/* 图表区域 - 保持不变 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {view === "overview" && (
              <>
                <h2 className="text-xl font-bold mb-4">来源分布</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                            data={sourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                              <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                              />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
          )}

          {view === "utm" && utmData.length > 0 && (
              <>
                <h2 className="text-xl font-bold mb-4">UTM 来源分析</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utmData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
          )}

          {view === "pages" && (
              <>
                <h2 className="text-xl font-bold mb-4">热门页面 TOP 10</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default SourceAnalysis;