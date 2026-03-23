import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ── PWA ── */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Sneakout" />
        <meta name="theme-color" content="#09090B" />

        {/* ── iOS PWA ── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sneakout" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="apple-touch-startup-image" href="/icons/icon.svg" />

        {/* ── Misc ── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#09090B" />

        {/* ── Icons ── */}
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />

        {/* ── Razorpay ── */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" />

        {/* ── Fonts ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-[#09090B]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
