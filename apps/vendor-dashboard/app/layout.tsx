import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from '../components/providers'
import { AppShell } from '../components/layout/AppShell'

const outfit = Outfit({ subsets: ['latin'] })

const themeBoot = `(function(){try{var m=localStorage.getItem('mmall-color-mode');if(m!=='light'&&m!=='dark'){var raw=localStorage.getItem('mmall-theme');if(raw){m=JSON.parse(raw)?.state?.mode}}if(m==='light'||m==='dark'){document.documentElement.classList.add(m)}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`

export const metadata: Metadata = {
  title: 'Vendor · MMall',
  description: 'Operate your store on the MMall commerce grid.',
  icons: { icon: '/mmall-bag.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className={outfit.className}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
