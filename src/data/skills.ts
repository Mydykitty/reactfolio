export interface Skill {
  name: string;
  level: number; // 0~100
}

export const skills: Skill[] = [
  { name: "HTML", level: 90 },
  { name: "CSS", level: 85 },
  { name: "JavaScript", level: 80 },
  { name: "TypeScript", level: 75 },
  { name: "React", level: 85 },
  { name: "TailwindCSS", level: 70 },
];
