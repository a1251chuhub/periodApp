import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'zh-TW',

  // Locale detection based on browser accept-language header
  localeDetection: true,
});

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // static files and API routes, but you can modify it to fit your needs
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
