/** Dati della sezione Competenze, raggruppati per ambito. */

export interface SkillGroup {
  title: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Linguaggi",
    skills: ["TypeScript", "JavaScript", "HTML", "CSS", "GLSL"],
  },
  {
    title: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "3D & Creative coding",
    skills: [
      "Three.js",
      "React Three Fiber",
      "drei",
      "Shader custom",
      "Post-processing",
    ],
  },
  {
    title: "Strumenti",
    skills: ["Node.js", "Git", "GitHub", "Vercel", "ESLint"],
  },
];
