import type { Metadata } from "next";
import { Zain } from "next/font/google";
import "./globals.css";

const zain = Zain({
  variable: "--font-zain",
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DialectIQ — حلل تقييمات قوقل ورد عليها تلقائياً | تجربة مجانية",
  description:
    "DialectIQ يحلل تقييمات قوقل بالذكاء الاصطناعي، يكتشف اللهجات السعودية، ويرد تلقائياً في ثوانٍ. وفّر وقتك وحسّن سمعتك. جرّب 7 أيام مجاناً.",
  keywords: "تحليل تقييمات قوقل, الرد التلقائي تقييمات, تحليل مشاعر العملاء, اللهجات السعودية, إدارة سمعة المتجر, google reviews analysis, AI sentiment analysis Arabic, auto reply google reviews",
  openGraph: {
    title: "DialectIQ — حلل تقييمات قوقل ورد عليها تلقائياً",
    description: "DialectIQ يحلل تقييمات قوقل بالذكاء الاصطناعي، يكتشف اللهجات السعودية، ويرد تلقائياً في ثوانٍ.",
    url: "https://d-iq.io",
    siteName: "DialectIQ",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DialectIQ — حلل تقييمات قوقل ورد عليها تلقائياً",
    description: "DialectIQ يحلل تقييمات قوقل بالذكاء الاصطناعي، يكتشف اللهجات السعودية، ويرد تلقائياً في ثوانٍ.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1975180017216817');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1975180017216817&ev=PageView&noscript=1"
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vxwz6lrq21");
            `,
          }}
        />
      </head>
      <body
        className={`${zain.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
