import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata = {
  title: 'منصة محمد الحزمي للذكاء الاصطناعي | Mohammed Alhazmi AI',
  description: 'منصة عربية متكاملة للذكاء الاصطناعي — صور، فيديو، موسيقى، برمجة، دردشة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
                <CustomScripts />
        </body>
    </html>
  );
}
