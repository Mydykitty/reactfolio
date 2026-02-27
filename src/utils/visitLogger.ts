import { supabase } from '../lib/supabase';

interface VisitData {
  path: string;
  referer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// 解析 UTM 参数
const parseUTMParams = (url: string): Partial<VisitData> => {
  try {
    const urlObj = new URL(url, window.location.origin);
    const params = urlObj.searchParams;
    
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
  } catch {
    return {};
  }
};

// 获取来源页面
const getReferer = (): string | undefined => {
  return document.referrer || undefined;
};


// 获取来源页面（测试代码）
/*
const getReferer = (): string | undefined => {
  // return document.referrer || undefined;

  // 测试用：根据 URL 参数动态返回
  const url = new URL(window.location.href);
  const testSource = url.searchParams.get('test_source');

  if (testSource === 'google') return 'https://www.google.com';
  if (testSource === 'facebook') return 'https://www.facebook.com';
  if (testSource === 'github') return 'https://github.com';

  return undefined;
};
*/


// 记录访问
export const logVisit = async () => {
  try {
    const currentPath = window.location.pathname + window.location.search;
    const referer = getReferer();
    const utmParams = parseUTMParams(window.location.href);

    const visitData: VisitData = {
      path: currentPath,
      referer,
      ...utmParams
    };

    // 异步记录，不阻塞页面加载
    supabase
        .from('visit_logs')
        .insert([visitData])
        .then(({ error }) => {
          if (error) console.error('记录访问失败:', error);
        });
  } catch (error) {
    console.error('记录访问出错:', error);
  }
};

// 获取来源统计
export const getSourceStats = async (days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('visit_logs')
    .select('*')
    .gte('visited_at', startDate.toISOString());
  
  if (error) {
    console.error('获取统计失败:', error);
    return null;
  }
  
  return analyzeSources(data || []);
};

// 分析来源数据
const analyzeSources = (logs: any[]) => {
  const stats = {
    total: logs.length,
    direct: 0,           // 直接访问
    search: 0,           // 搜索引擎
    social: 0,           // 社交媒体
    external: 0,         // 外部链接
    utm: {
      google: 0,
      facebook: 0,
      twitter: 0,
      github: 0,
      other: 0
    },
    pages: {} as Record<string, number>,
    daily: {} as Record<string, number>
  };

  logs.forEach(log => {
    // 按天统计
    const day = log.visited_at.split('T')[0];
    stats.daily[day] = (stats.daily[day] || 0) + 1;

    // 按页面统计
    stats.pages[log.path] = (stats.pages[log.path] || 0) + 1;

    // 分析来源
    // 分析来源（不统计 UTM）
    if (!log.referer) {
      stats.direct++;
    } else if (log.referer.includes('google.com')) {
      stats.search++;
    } else if (log.referer.includes('facebook.com')) {
      stats.social++;
    } else if (log.referer.includes('twitter.com')) {
      stats.social++;
    } else if (log.referer.includes('github.com')) {
      stats.external++;
    } else {
      stats.external++;
    }

    // 单独统计 UTM
    if (log.utm_source) {
      if (log.utm_source === 'google') stats.utm.google++;
      else if (log.utm_source === 'facebook') stats.utm.facebook++;
      else if (log.utm_source === 'twitter') stats.utm.twitter++;
      else if (log.utm_source === 'github') stats.utm.github++;
      else stats.utm.other++;
    }
  });

  return stats;
};