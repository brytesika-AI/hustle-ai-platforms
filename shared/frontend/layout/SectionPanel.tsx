import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function SectionPanel({ title, subtitle, children }: Props) {
  return (
    <section className="panel">
      <h2 className="section-title">{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
      <div className="stack" style={{ marginTop: 16 }}>
        {children}
      </div>
    </section>
  );
}
