import './globals.css'
import RobotAssistant from '../components/ai/RobotAssistant'

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
