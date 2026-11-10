import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { RoleProvider } from "@/providers/role-provider";

import { APP_DESCRIPTION, BRAND_NAME, STORAGE_PREFIX } from "../lib/brand";

const preHydrationInitScript = `(() => {
  try {
    const theme = localStorage.getItem('${STORAGE_PREFIX}.theme');
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
    const locale = localStorage.getItem('${STORAGE_PREFIX}.locale');
    const resolvedLocale = locale === 'pt' || locale === 'en' || locale === 'am' ? locale : 'pt';
    document.documentElement.lang = resolvedLocale;
  } catch {
    // ignore
  }
})();`;

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | Plataforma de aprendizagem`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: BRAND_NAME,
  keywords: ["PACA", "aprendizagem", "tutoria", "aulas", "ensino"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preHydrationInitScript }} />
      </head>
      <body className="antialiased">
        <Providers>
          <RoleProvider>
            {children}
          </RoleProvider>
        </Providers>
      </body>
    </html>
  );
}
