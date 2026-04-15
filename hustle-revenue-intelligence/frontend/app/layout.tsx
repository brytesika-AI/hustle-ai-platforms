import "./globals.css";
import { ReactNode } from "react";

import { ProductLayout } from "../../../shared/frontend/layout/ProductLayout";

export const metadata = {
  title: "Hustle Revenue Intelligence",
  description: "Pricing and revenue optimization for African businesses."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProductLayout
          title="Hustle Revenue Intelligence"
          description="Cloudflare-first revenue intelligence for pricing discipline, churn impact analysis, commercial drivers, and expansion decision support."
        >
          {children}
        </ProductLayout>
      </body>
    </html>
  );
}
