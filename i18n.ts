import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en-US', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is not undefined
  const validatedLocale = locale as Locale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(validatedLocale)) notFound();

  return {
    locale: validatedLocale,
    messages: (await import(`./src/locales/${validatedLocale}.json`)).default
  };
});
