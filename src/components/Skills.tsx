import type { FC } from "react";
import { useEffect, useState } from "react";
import { skills } from "../data/skills";
import type { Skill } from "../data/skills";
import { useInView } from "react-intersection-observer";

const Skills: FC = () => {
  // 监听整个 Skills 区块是否进入视口
  const { ref, inView } = useInView({ 
    triggerOnce: true,
    threshold: 0.1 // 当10%的组件进入视口时触发
  });

  // 初始化每个技能等级为 0
  const [animatedLevels, setAnimatedLevels] = useState<Skill[]>(
    skills.map(s => ({ ...s, level: 0 }))
  );

  // 调试信息
  console.log('Skills component - inView:', inView);
  console.log('Skills component - animatedLevels:', animatedLevels);

  // 组件挂载后，如果 inView 为 true，依次动画每个技能条
  useEffect(() => {
    console.log('useEffect triggered - inView:', inView);
    
    if (!inView) {
      // 如果3秒后仍未进入视口，强制触发动画
      const fallbackTimer = setTimeout(() => {
        console.log('Fallback animation triggered');
        skills.forEach((skill, idx) => {
          setTimeout(() => {
            setAnimatedLevels(prev => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], level: skill.level };
              return copy;
            });
          }, idx * 200);
        });
      }, 3000);
      
      return () => clearTimeout(fallbackTimer);
    }

    // 正常动画逻辑
    skills.forEach((skill, idx) => {
      setTimeout(() => {
        setAnimatedLevels(prev => {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], level: skill.level };
          return copy;
        });
      }, idx * 200); // 每个技能条延迟 200ms 动画
    });
  }, [inView]);

  return (
    <section ref={ref} style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Skills</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {animatedLevels.map(skill => (
          <div key={skill.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: '500' }}>{skill.name}</span>
              <span style={{ fontSize: '0.875rem' }}>{skill.level}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              backgroundColor: '#e5e7eb', 
              height: '1rem', 
              borderRadius: '0.25rem', 
              overflow: 'hidden' 
            }}>
              <div
                style={{ 
                  backgroundColor: '#3b82f6',
                  height: '100%',
                  borderRadius: '0.25rem',
                  transition: 'all 1s ease-out',
                  width: `${skill.level}%`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;