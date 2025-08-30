import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Diff to Commit',
  description: 'Convert diff files to commit messages',
  icons: {
    icon: [
      {
        url: 'favicon-light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: 'favicon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)'
      }
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 