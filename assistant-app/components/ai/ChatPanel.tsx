"use client"
import React, { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'

type Msg = { id: string; from: 'user'|'bot'; text: string }

export default function ChatPanel({ messages, onSend, suggestions, onSuggest, onClose, isResponding }: { messages: Msg[]; onSend: (t:string)=>void; suggestions: string[]; onSuggest: (s:string)=>void; onClose: ()=>void; isResponding?: boolean }){
  const [val, setVal] = useState('')
  const listRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [messages])

  function submit(){ if(!val.trim()) return; onSend(val.trim()); setVal('') }

  return (
    <div className="c4-chat-panel" role="dialog" aria-label="C4 Bot chat">
      <div className="c4-chat-header">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:8,background:'linear-gradient(90deg,#052230,#062634)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.02)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3" fill="#00E5FF" /></svg>
          </div>
          <div>
            <div className="c4-chat-title">C4-Bot</div>
            <div className="muted" style={{fontSize:12}}>Your friendly Code4 assistant</div>
          </div>
        </div>
        <button aria-label="Close chat" onClick={onClose} style={{background:'transparent',border:'none',color:'white'}}><X size={18} /></button>
      </div>

      <div style={{padding:'10px 14px'}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {suggestions.map(s => (
            <button key={s} className="c4-quick-btn" onClick={()=> onSuggest(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="c4-chat-messages" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`c4-msg ${m.from === 'user' ? 'user':'bot'}`}>{m.text}</div>
        ))}
        {isResponding && <div className="c4-msg bot">Typing…</div>}
      </div>

      <div className="c4-chat-actions">
        <div className="c4-input">
          <input value={val} onChange={(e)=> setVal(e.target.value)} onKeyDown={(e)=> { if(e.key === 'Enter') submit() }} placeholder="Ask me something..." />
          <button className="c4-send" onClick={submit} aria-label="Send"><Send size={16} color="#022" /></button>
        </div>
      </div>
    </div>
  )
}
