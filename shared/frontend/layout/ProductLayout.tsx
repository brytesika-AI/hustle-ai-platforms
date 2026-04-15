import { ReactNode } from "react";

import { BrandFooter } from "../footer/BrandFooter";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ProductLayout({ title, description, children }: Props) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
      <BrandFooter />
    </div>
  );
}
