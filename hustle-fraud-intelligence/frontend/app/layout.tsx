import "./globals.css";
import { ReactNode } from "react";

import { ProductLayout } from "../../../shared/frontend/layout/ProductLayout";

export const metadata = {
  title: "Hustle Fraud Intelligence",
  description: "Risk management and fraud detection using generative AI in African SMEs."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProductLayout
          title="Hustle Fraud Intelligence"
          description="Risk management and fraud detection using generative AI in African SMEs, delivered through a Cloudflare-first governance and anomaly review platform."
        >
          {children}
        </ProductLayout>
      </body>
    </html>
  );
}
