"use client"
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import RobotAvatar from './RobotAvatar'
import ChatPanel from './ChatPanel'

type Message = { id: string; from: 'user' | 'bot'; text: string }

const SUGGESTIONS = [
  'Tell me about your services',
  'What is cybersecurity?',
  'Show portfolio',
  'Contact Code4',
  'Get a quote'
]

export default function RobotAssistant(){
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', from: 'bot', text: "Hi! I'm C4-Bot. How can I help you today?" }])
  const [isResponding, setResponding] = useState(false)
  const [headFollow, setHeadFollow] = useState({ x: 0, y: 0 })

  // simple response mapping
  // Knowledge base
  const KB = {
    companyName: 'Code4',
    tagline: 'Code the Future',
    website: 'www.code4dev.vercel.app',
    email: 'we.code4@gmail.com',
    description: 'Code4 is a software development, cybersecurity, and data solutions company that helps businesses build, secure, and scale digital products. We also provide coding and AI training through Code4 Academy.',
    quick: {
      services: 'We specialize in custom software development, web and mobile applications, cybersecurity, cloud solutions, data analysis, Code4 Academy, and DevOps with QA testing.',
      cybersecurity: 'We protect your systems, networks, and data through assessments, secure architecture, and monitoring.',
      data: 'We transform data into actionable insights using analytics, dashboards, and visualizations.',
      academy: 'We provide practical training in coding, software development, AI, and data analysis through Code4 Academy.',
      portfolio: 'We have built e-commerce platforms, school management systems, cybersecurity dashboards, and AI business assistants.',
      contact: 'You can reach us at we.code4@gmail.com or visit www.code4dev.vercel.app.'
    }
  }

  function cannedResponseFor(text: string){
    const t = (text || '').toLowerCase();
    if(t.includes('service') || t.includes('what do you offer')) return KB.quick.services;
    if(t.includes('cyber')) return KB.quick.cybersecurity;
    if(t.includes('data') || t.includes('analytics')) return KB.quick.data;
    if(t.includes('academy') || t.includes('training')) return KB.quick.academy;
    if(t.includes('portfolio') || t.includes('projects')) return KB.quick.portfolio;
    if(t.includes('contact') || t.includes('email') || t.includes('reach')) return KB.quick.contact;
    if(t.includes('quote')) return "Tell us about your project and we'll provide a tailored proposal.";
    return `I'm sorry — I don't know that yet. Please email us at ${KB.email} or visit ${KB.website} for more details.`
  }

  function pushMessage(m: Message){ setMessages(prev => [...prev, m]) }

  async function sendUserMessage(text: string){
    if(!text) return
    const id = 'u_' + Date.now()
    pushMessage({ id, from: 'user', text })
    setResponding(true)
    // emulate delay + typing
    await new Promise(r => setTimeout(r, 700))
    const botText = cannedResponseFor(text)
    await new Promise(r => setTimeout(r, 900))
    pushMessage({ id: 'b_' + Date.now(), from: 'bot', text: botText })
    setResponding(false)
  }

  // suggested action handler
  function onSuggest(term: string){ sendUserMessage(term) }

  // follow cursor mildly
  useEffect(()=>{
    function onMove(e: MouseEvent){
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setHeadFollow({ x: x * 0.35, y: y * 0.25 })
    }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  }, [])

  // wave once on load
  const [didWave, setDidWave] = useState(false)
  useEffect(()=>{ setTimeout(()=> setDidWave(true), 800) }, [])

  return (
    <div className="c4-robot-wrap">
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:10}}>
        <AnimatePresence>
          {open && (
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} transition={{duration:0.18}}>
              <ChatPanel
                messages={messages}
                onSend={sendUserMessage}
                suggestions={SUGGESTIONS}
                onSuggest={onSuggest}
                onClose={()=> setOpen(false)}
                isResponding={isResponding}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{position:'relative'}}>
          <div className="c4-robot-pulse" aria-hidden="true" style={{background:'radial-gradient(circle, rgba(0,230,255,0.06), transparent 30%)', animation:'pulse 2.8s infinite'}}></div>
          <RobotAvatar
            onClick={()=> setOpen(s => !s)}
            isSpeaking={isResponding}
            headFollow={headFollow}
            wave={didWave}
          />
        </div>
      </div>
    </div>
  )
}
