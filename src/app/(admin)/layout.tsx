export default function AdminRootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body className="bg-cream text-dark">
          {children}
        </body>
      </html>
    );
  }