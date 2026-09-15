import "./globals.css";

export const metadata = {
  title: "Kaskinha - Sistema de Vendas",
  description: "Sistema de vendas, caixa e estoque da Kaskinha",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#CE3C4B",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kaskinha" />
      </head>
      <body>{children}</body>
    </html>
  );
}
