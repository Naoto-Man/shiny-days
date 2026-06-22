import './globals.css';

export const metadata = {
  title: 'My Schedule',
  description: '予定と締切を、いつでもすぐ確認',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="min-h-screen font-sans antialiased text-[#1a1a2e]">{children}</body>
    </html>
  );
}
