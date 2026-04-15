import "./globals.css";
import { ReactNode } from "react";

import { ProductLayout } from "../../../shared/frontend/layout/ProductLayout";

export const metadata = {
  title: "Hustle Workforce",
  description: "Executive-grade workforce intelligence for African SMEs."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProductLayout
          title="Hustle Workforce"
          description="Flagship Hustle AI platform for finance, operations, sales, growth, strategy, and SME knowledge visibility through a Cloudflare-first web application."
        >
          {children}
        </ProductLayout>
      </body>
    </html>
  );
}
