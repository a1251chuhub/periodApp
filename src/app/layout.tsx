import './globals.css'
import { LIFFProvider } from '@/components/providers/LIFFProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        <LIFFProvider>
          {children}
        </LIFFProvider>
      </body>
    </html>
  )
}
