import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Chyte",
  description: "FUTO food & vendor platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}