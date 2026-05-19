import dynamic from 'next/dynamic'
import '../styles/globals.css'

const RobotAssistant = dynamic(() => import('../components/ai/RobotAssistant'), {
  ssr: false,
  loading: () => null,
})

export const metadata = {
  title: 'Assistant Demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body>
        {children}
        <RobotAssistant />
      </body>
    </html>
  )
}
