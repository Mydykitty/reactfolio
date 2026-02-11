import type { FC, ReactNode } from "react";

interface SectionProps {
  title?: string;
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ title, children }) => {
  return (
    <section className="mb-8">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {children}
    </section>
  );
};

export default Section;
