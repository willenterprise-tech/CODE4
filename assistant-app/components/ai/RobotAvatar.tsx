"use client"
import React, { useEffect, useState } from 'react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'

export default function RobotAvatar({ onClick, isSpeaking, headFollow, wave, disableMotion }: { onClick?: () => void; isSpeaking?: boolean; headFollow?: { x:number; y:number }; wave?: boolean; disableMotion?: boolean }){
  const [blink, setBlink] = useState(false)
  const controls = useAnimation()
  const prefersReducedMotion = useReducedMotion()

  useEffect(()=>{
    // random blinking
    if(prefersReducedMotion) return
    let mounted = true
    function tick(){
      if(!mounted) return
      const delay = 2500 + Math.random()*4000
      setTimeout(()=>{ setBlink(true); setTimeout(()=> setBlink(false), 160); if(mounted) tick() }, delay)
    }
    tick()
    return ()=> { mounted = false }
  }, [prefersReducedMotion])

  useEffect(()=>{
    if(isSpeaking) controls.start({ scale: 1.03 })
    else controls.start({ scale: 1 })
  }, [isSpeaking, controls])

  // wave on mount via small rotation animation of the "arm"
  const canAnimate = !disableMotion && !prefersReducedMotion
  const armAnim = canAnimate && wave ? { rotate: [0, -18, 12, -6, 0], transition: { duration: 1.3 } } : { rotate: 0 }

  const eyeOffsetX = (headFollow?.x ?? 0) * 6
  const eyeOffsetY = (headFollow?.y ?? 0) * 4

  return (
    <motion.button aria-label="Open chat" title="Open chat" onClick={onClick} className="c4-robot-btn" whileHover={canAnimate ? { scale: 1.03 } : undefined} animate={controls}>
      <span className="c4-robot-halo" aria-hidden="true"></span>
      <motion.svg className="c4-robot-floating" width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#062634" />
            <stop offset="1" stopColor="#071827" />
          </linearGradient>
        </defs>
        <g transform="translate(6,6)">
          <rect x="6" y="14" width="60" height="44" rx="10" fill="#071827" className="robot-body" stroke="rgba(0,220,255,0.14)" />
          <motion.g transform={`translate(18,22)`}>
            <motion.circle className="robot-eye robot-eyes" cx={8 + eyeOffsetX} cy={8 + eyeOffsetY} r={6} fill="#00E5FF" />
            <motion.circle className="robot-eye robot-eyes" cx={32 + eyeOffsetX} cy={8 + eyeOffsetY} r={6} fill="#00E5FF" />
            <motion.rect x="2" y="28" width="40" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
          </motion.g>
          <motion.g style={{ originX: '50%', originY: '50%' }} animate={armAnim}>
            <rect x="46" y="10" width="8" height="26" rx="3" fill="#071827" stroke="rgba(0,220,255,0.12)" />
          </motion.g>
        </g>
      </motion.svg>
      <style jsx>{`
        .robot-eye{transition: transform .12s linear}
      `}</style>
    </motion.button>
  )
}
