import "./globals.css";
import { ReactNode } from "react";

import { ProductLayout } from "../../../shared/frontend/layout/ProductLayout";

export const metadata = {
  title: "Hustle Inventory Intelligence",
  description: "Inventory visibility and replenishment intelligence for African SMEs."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProductLayout
          title="Hustle Inventory Intelligence"
          description="Cloudflare-first stock visibility, replenishment optimization, supplier dependency detection, and inventory decision support for African SMEs and growth-stage businesses."
        >
          {children}
        </ProductLayout>
      </body>
    </html>
  );
}
