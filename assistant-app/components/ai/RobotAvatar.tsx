"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function RobotAvatar({ onClick, isSpeaking, headFollow, wave }: { onClick?: () => void; isSpeaking?: boolean; headFollow?: { x:number; y:number }; wave?: boolean }){
  const [blink, setBlink] = useState(false)
  const controls = useAnimation()
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const suppressClickRef = useRef(false)

  // dragging refs (use refs to avoid re-rendering while dragging)
  const dragRef = useRef({ pointerId: null as number | null, startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false, active: false })
  const DRAG_THRESHOLD = 18

  useEffect(()=>{
    // random blinking
    let mounted = true
    function tick(){
      if(!mounted) return
      const delay = 2500 + Math.random()*4000
      setTimeout(()=>{ setBlink(true); setTimeout(()=> setBlink(false), 160); if(mounted) tick() }, delay)
    }
    tick()
    return ()=> { mounted = false }
  }, [])

  // Drag behavior: start drag immediately for mouse/pen, for touch start only on horizontal swipe
  useEffect(()=>{
    const btn = btnRef.current
    if(!btn) return

    function prepareForDrag(clientX: number, clientY: number){
      const rect = btn.getBoundingClientRect()
      btn.style.position = 'fixed'
      btn.style.left = rect.left + 'px'
      btn.style.top = rect.top + 'px'
      btn.style.right = 'auto'
      btn.style.bottom = 'auto'
      btn.style.transform = 'none'
      btn.style.zIndex = '2147483647'
    }

    function onPointerDown(e: PointerEvent){
      if ((e as any).button && (e as any).button !== 0) return
      dragRef.current.pointerId = e.pointerId
      dragRef.current.startX = e.clientX
      dragRef.current.startY = e.clientY
      const rect = btn.getBoundingClientRect()
      dragRef.current.offsetX = e.clientX - rect.left
      dragRef.current.offsetY = e.clientY - rect.top
      dragRef.current.moved = false
      dragRef.current.active = false

      if ((e as any).pointerType !== 'touch'){
        dragRef.current.active = true
        btn.classList.add('dragging')
        prepareForDrag(e.clientX, e.clientY)
        try { (btn as any).setPointerCapture && (btn as any).setPointerCapture(e.pointerId) } catch (err) {}
        e.preventDefault()
      }

      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerUp)
      document.addEventListener('pointercancel', onPointerUp)
    }

    function onPointerMove(e: PointerEvent){
      if (dragRef.current.pointerId !== e.pointerId) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      if (!dragRef.current.moved){
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        dragRef.current.moved = true
        if (!dragRef.current.active && (e as any).pointerType === 'touch'){
          if (Math.abs(dx) > Math.abs(dy) * 1.6 && Math.abs(dx) > DRAG_THRESHOLD){
            dragRef.current.active = true
            btn.classList.add('dragging')
            try { (btn as any).setPointerCapture && (btn as any).setPointerCapture(e.pointerId) } catch (err) {}
            prepareForDrag(e.clientX, e.clientY)
          } else {
            // vertical or ambiguous gesture -> allow page scroll
            cleanup()
            return
          }
        }
      }

      if (dragRef.current.active){
        e.preventDefault()
        const left = e.clientX - dragRef.current.offsetX
        const top = e.clientY - dragRef.current.offsetY
        const vw = window.innerWidth
        const vh = window.innerHeight
        const rect = btn.getBoundingClientRect()
        const w = rect.width
        const h = rect.height
        const clampedLeft = Math.max(8, Math.min(left, vw - w - 8))
        const clampedTop = Math.max(8, Math.min(top, vh - h - 8))
        btn.style.left = clampedLeft + 'px'
        btn.style.top = clampedTop + 'px'
        suppressClickRef.current = true
      }
    }

    function onPointerUp(e: PointerEvent){
      if (dragRef.current.pointerId !== e.pointerId){ cleanup(); return }
      if (dragRef.current.active){
        btn.classList.remove('dragging')
        try { (btn as any).releasePointerCapture && (btn as any).releasePointerCapture(e.pointerId) } catch (err) {}
        suppressClickRef.current = true
        setTimeout(()=> { suppressClickRef.current = false }, 50)
      }
      cleanup()
    }

    function cleanup(){
      try { document.removeEventListener('pointermove', onPointerMove) } catch(err){}
      try { document.removeEventListener('pointerup', onPointerUp) } catch(err){}
      try { document.removeEventListener('pointercancel', onPointerUp) } catch(err){}
      dragRef.current.pointerId = null
      dragRef.current.active = false
      dragRef.current.moved = false
    }

    btn.addEventListener('pointerdown', onPointerDown)

    // Touch fallback for browsers without PointerEvent support
    const touchRemovers: Array<() => void> = []
    if (typeof window.PointerEvent === 'undefined'){
      function onTouchStart(ev: TouchEvent){
        if(!ev.touches || ev.touches.length !== 1) return
        const t = ev.touches[0]
        dragRef.current.startX = t.clientX
        dragRef.current.startY = t.clientY
        const rect = btn.getBoundingClientRect()
        dragRef.current.offsetX = t.clientX - rect.left
        dragRef.current.offsetY = t.clientY - rect.top
        dragRef.current.moved = false
        dragRef.current.active = false
      }

      function onTouchMove(ev: TouchEvent){
        if(!ev.touches || ev.touches.length !== 1) return
        const t = ev.touches[0]
        const dx = t.clientX - dragRef.current.startX
        const dy = t.clientY - dragRef.current.startY

        if(!dragRef.current.moved){
            if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
            dragRef.current.moved = true
            if (Math.abs(dx) > Math.abs(dy) * 1.6 && Math.abs(dx) > DRAG_THRESHOLD){
              dragRef.current.active = true
              btn.classList.add('dragging')
              prepareForDrag(t.clientX, t.clientY)
              ev.preventDefault()
            } else {
              cleanup()
              return
            }
          }

          if(dragRef.current.active){
            ev.preventDefault()
            const left = t.clientX - dragRef.current.offsetX
            const top = t.clientY - dragRef.current.offsetY
            const vw = window.innerWidth
            const vh = window.innerHeight
            const rect = btn.getBoundingClientRect()
            const w = rect.width
            const h = rect.height
            const clampedLeft = Math.max(8, Math.min(left, vw - w - 8))
            const clampedTop = Math.max(8, Math.min(top, vh - h - 8))
            btn.style.left = clampedLeft + 'px'
            btn.style.top = clampedTop + 'px'
            suppressClickRef.current = true
          }
      }

      function onTouchEnd(ev: TouchEvent){
        if(dragRef.current.active){
          btn.classList.remove('dragging')
          suppressClickRef.current = true
          setTimeout(()=> { suppressClickRef.current = false }, 50)
        }
        dragRef.current.moved = false
        dragRef.current.active = false
      }

      btn.addEventListener('touchstart', onTouchStart, { passive: true })
      btn.addEventListener('touchmove', onTouchMove, { passive: false })
      btn.addEventListener('touchend', onTouchEnd)
      btn.addEventListener('touchcancel', onTouchEnd)

      touchRemovers.push(()=> btn.removeEventListener('touchstart', onTouchStart))
      touchRemovers.push(()=> btn.removeEventListener('touchmove', onTouchMove))
      touchRemovers.push(()=> btn.removeEventListener('touchend', onTouchEnd))
      touchRemovers.push(()=> btn.removeEventListener('touchcancel', onTouchEnd))
    }

    return ()=>{ btn.removeEventListener('pointerdown', onPointerDown); touchRemovers.forEach(fn=>fn()); cleanup() }
  }, [])

  useEffect(()=>{
    if(isSpeaking) controls.start({ scale: 1.03 })
    else controls.start({ scale: 1 })
  }, [isSpeaking, controls])

  // wave on mount via small rotation animation of the "arm"
  const armAnim = wave ? { rotate: [0, -18, 12, -6, 0], transition: { duration: 1.3 } } : { rotate: 0 }

  const eyeOffsetX = (headFollow?.x ?? 0) * 6
  const eyeOffsetY = (headFollow?.y ?? 0) * 4

  function handleClick(e: React.MouseEvent){
    if(suppressClickRef.current){ e.stopPropagation(); e.preventDefault(); suppressClickRef.current = false; return }
    if(onClick) onClick()
  }

  return (
    <motion.button ref={btnRef} aria-label="Open chat" title="Open chat" onClick={handleClick} className="c4-robot-btn" whileHover={{ scale: 1.03 }} animate={controls}>
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
