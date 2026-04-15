import "./globals.css";
import { ReactNode } from "react";

import { ProductLayout } from "../../../shared/frontend/layout/ProductLayout";

export const metadata = {
  title: "Hustle CX Intelligence",
  description: "AI-powered customer support and customer intelligence for African businesses."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProductLayout
          title="Hustle CX Intelligence"
          description="Cloudflare-first customer intelligence for transcript classification, churn risk, root-cause visibility, and executive CX decision support."
        >
          {children}
        </ProductLayout>
      </body>
    </html>
  );
}
