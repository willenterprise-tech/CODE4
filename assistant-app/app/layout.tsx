import './globals.css'
import RobotAssistant from '../components/ai/RobotAssistant'

export const metadata = {
  title: 'G3 Labs Assistant',
  description: 'Chat with the G3 Labs virtual assistant.',
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
