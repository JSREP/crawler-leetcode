import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AntdProvider } from '@/components/providers/AntdProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '爬虫技术挑战平台',
  description: '突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力',
  keywords: ['爬虫', '反爬虫', '数据采集', '技术挑战', 'Web Scraping'],
  authors: [{ name: 'JSREP' }],
  creator: 'JSREP',
  publisher: 'JSREP',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: '爬虫技术挑战平台',
    description: '突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力',
    url: '/',
    siteName: '爬虫技术挑战平台',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '爬虫技术挑战平台',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '爬虫技术挑战平台',
    description: '突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.className}>
        <AntdProvider>
          <AuthProvider>
            {/* GitHub Fork Ribbon */}
            <div className="github-fork-ribbon-wrapper right-top fixed z-50">
              <div className="github-fork-ribbon">
                <a href="https://github.com/JSREP/crawler-leetcode" target="_blank" rel="noopener noreferrer">
                  Fork me on GitHub
                </a>
              </div>
            </div>

            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
