import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { LIFFProvider } from '@/components/providers/LIFFProvider'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="zh-TW">
      <body>
        <NextIntlClientProvider messages={messages}>
          <LIFFProvider>
            {children}
          </LIFFProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
