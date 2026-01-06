import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ditchfork | 가장 신뢰받는 음악 비평 커뮤니티",
  description: "최신 앨범 리뷰, 평점, 그리고 페스티벌 동행 찾기까지. 음악 애호가들을 위한 프리미엄 커뮤니티 Ditchfork입니다.",
  metadataBase: new URL("https://ditchfork.vercel.app"),
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    }
  } catch (e) {
    console.error("Layout auth check failed:", e);
  }

  return (
    <html lang="en">
      <body>
        <body>
          <Navbar user={user} />
          {user && <ProfileCompletionModal user={user} />}
          {children}
        </body>
      </body>
    </html>
  );
}
