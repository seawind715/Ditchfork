import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ditchfork | 가장 신뢰받는 음악 비평 커뮤니티",
  description: "최신 앨범 리뷰, 평점, 그리고 페스티벌 동행 찾기까지. 음악 애호가들을 위한 프리미엄 커뮤니티 Ditchfork입니다.",
  metadataBase: new URL("http://localhost:3000"), // Will update with Vercel URL later
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}
