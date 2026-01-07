import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import { Metadata } from "next";

export const metadata = {
  title: {
    default: "디치포크 Ditchfork - DGHS 문화 생활 커뮤니티",
    template: "%s | 디치포크 Ditchfork"
  },
  description: "DGHS 문화 생활 커뮤니티 디치포크(Ditchfork). 음악 취향 공유부터 학교 축제 정보까지.",
  keywords: ["디치포크", "Ditchfork", "DGHS", "동탄국제고", "동국고", "음악 리뷰", "앨범 추천", "학교 축제", "문화 생활"],
  openGraph: {
    title: "디치포크 Ditchfork",
    description: "DGHS 문화 생활 커뮤니티 디치포크",
    type: "website",
    locale: "ko_KR",
  },
  verification: {
    google: "TB2liyNSS_7Q-Y-UBGEFtE3do99MkpiVA9vy7m9TqjY",
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
    <html lang="ko">
      <body>
        <Navbar user={user} />
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        <footer className="footer section">
          <div className="container" style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
            <p>&copy; {new Date().getFullYear()} Ditchfork. All rights reserved.</p>
          </div>
        </footer>
        {user && <ProfileCompletionModal user={user} />}
      </body>
    </html>
  );
}
