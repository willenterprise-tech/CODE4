"use client"
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
  const rootRef = useRef<HTMLDivElement|null>(null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', from: 'bot', text: "Hi! I'm C4-Bot. How can I help you today?" }])
  const [isResponding, setResponding] = useState(false)
  const [headFollow, setHeadFollow] = useState({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()

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
    const pointerMedia = window.matchMedia('(pointer: coarse)')
    const mobileMedia = window.matchMedia('(max-width: 768px)')
    setIsTouchDevice(pointerMedia.matches)
    setIsMobile(mobileMedia.matches)

    const pointerListener = (evt: MediaQueryListEvent) => setIsTouchDevice(evt.matches)
    const mobileListener = (evt: MediaQueryListEvent) => setIsMobile(evt.matches)

    pointerMedia.addEventListener?.('change', pointerListener)
    mobileMedia.addEventListener?.('change', mobileListener)

    return () => {
      pointerMedia.removeEventListener?.('change', pointerListener)
      mobileMedia.removeEventListener?.('change', mobileListener)
    }
  }, [])

  useEffect(()=>{
    if(prefersReducedMotion || isTouchDevice || isMobile) return
    function onMove(e: MouseEvent){
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setHeadFollow({ x: x * 0.35, y: y * 0.25 })
    }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  }, [prefersReducedMotion, isTouchDevice, isMobile])

  const [didWave, setDidWave] = useState(false)
  useEffect(()=>{ setTimeout(()=> setDidWave(true), 800) }, [])

  useEffect(()=>{
    if(!open) return
    function onDocumentClick(event: MouseEvent){
      if(!rootRef.current) return
      if(!rootRef.current.contains(event.target as Node)){
        setOpen(false)
      }
    }
    document.addEventListener('click', onDocumentClick)
    return ()=> document.removeEventListener('click', onDocumentClick)
  }, [open])

  const canAnimate = !prefersReducedMotion && !isTouchDevice && !isMobile
  const floatMotion = canAnimate ? { y: isMobile ? [0, -4, 0] : [0, -10, 0] } : { y: [0, 0, 0] }

  return (
    <div ref={rootRef} className="fixed right-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 pointer-events-none flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto mb-3 w-[min(92vw,360px)] h-[min(70vh,520px)] rounded-2xl"
          >
            <ChatPanel
              className="h-full w-full rounded-2xl"
              messages={messages}
              onSend={sendUserMessage}
              suggestions={SUGGESTIONS}
              onSuggest={onSuggest}
              onClose={()=> setOpen(false)}
              isResponding={isResponding}
              autoFocus={open}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RobotAvatar
        onClick={()=> setOpen(s => !s)}
        isSpeaking={isResponding}
        headFollow={isTouchDevice ? { x: 0, y: 0 } : headFollow}
        wave={didWave && canAnimate}
        disableMotion={!canAnimate}
        floatMotion={floatMotion}
        isTouchDevice={isTouchDevice}
        isMobile={isMobile}
      />
    </div>
  )
}
