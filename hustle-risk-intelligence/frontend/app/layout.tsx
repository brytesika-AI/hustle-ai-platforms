import "./globals.css";
import { ReactNode } from "react";

import { ProductLayout } from "../../../shared/frontend/layout/ProductLayout";

export const metadata = {
  title: "Hustle Risk Intelligence",
  description: "Executive-grade risk monitoring for African SMEs and growth businesses."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProductLayout
          title="Hustle Risk Intelligence"
          description="Cloudflare-first risk monitoring and scenario planning for financial, operational, supplier, customer, and exposure risks across African businesses."
        >
          {children}
        </ProductLayout>
      </body>
    </html>
  );
}
