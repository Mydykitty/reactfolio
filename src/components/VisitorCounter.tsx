// src/components/VisitorCounter.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const VisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleVisitor = async () => {
      try {
        // 检查是否已经在本会话中访问过
        const hasVisited = sessionStorage.getItem("hasVisited");

        if (!hasVisited) {
          // 新访客：先获取当前计数
          const { data: currentData, error: selectError } = await supabase
            .from("site_stats")
            .select("visitor_count")
            .eq("id", 1)
            .single();

          if (selectError) throw selectError;

          // 更新计数 +1
          const newCount = (currentData?.visitor_count || 0) + 1;
          const { error: updateError } = await supabase
            .from("site_stats")
            .update({
              visitor_count: newCount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", 1);

          if (updateError) throw updateError;

          setCount(newCount);
          sessionStorage.setItem("hasVisited", "true");
        } else {
          // 老访客：只获取当前计数
          const { data, error } = await supabase
            .from("site_stats")
            .select("visitor_count")
            .eq("id", 1)
            .single();

          if (error) throw error;
          setCount(data.visitor_count);
        }
      } catch (error) {
        console.error("Error updating visitor count:", error);
        // 出错时显示默认值
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    handleVisitor();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
        ···
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <span>{count}</span>
    </div>
  );
};

export default VisitorCounter;
