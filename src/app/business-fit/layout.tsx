import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Fit Assessment",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BusinessFitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
