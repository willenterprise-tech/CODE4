/* C4 Assistant embeddable widget (vanilla JS) */
(function(){
  const rootId = 'c4-assistant'
  // Do not inject the assistant on small viewports (mobile).
  // This prevents loading UI and event listeners that interfere on phones.
  let isMobileViewport = false
  try { isMobileViewport = !!(window && window.matchMedia && window.matchMedia('(max-width:768px)').matches) } catch(e) { isMobileViewport = false }
  if (isMobileViewport) return
  if (document.getElementById(rootId)) return

  // create root
  const root = document.createElement('div')
  root.id = rootId
  root.innerHTML = `
    <div class="c4a-panel" role="dialog" aria-label="C4 Bot chat" hidden>
      <div class="c4a-chat-header">
        <div style="display:flex;gap:12px;align-items:center">
          <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(90deg,#052230,#062634);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3" fill="#00E5FF" /></svg></div>
          <div>
            <div class="c4a-chat-title">C4-Bot</div>
            <div class="c4a-muted">Your friendly Code4 assistant</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button data-c4-close aria-label="Close chat" style="background:transparent;border:none;color:#fff;cursor:pointer;font-size:16px">✕</button>
        </div>
      </div>
      <div class="c4a-quick-actions">
        <button class="c4a-quick-btn">Tell me about your services</button>
        <button class="c4a-quick-btn">What is cybersecurity?</button>
        <button class="c4a-quick-btn">Show portfolio</button>
        <button class="c4a-quick-btn">Contact Code4</button>
        <button class="c4a-quick-btn">Get a quote</button>
      </div>
      <div class="c4a-chat-messages" aria-live="polite"></div>
      <div class="c4a-input-bar">
        <div class="c4a-input"><input placeholder="Ask me something..." aria-label="Chat input"></div>
        <button class="c4a-send" aria-label="Send">➤</button>
      </div>
    </div>
    <button class="c4a-robot-btn" aria-label="Open chat">
      <div class="c4a-halo" aria-hidden="true"></div>
      <div class="c4a-pulse" aria-hidden="true"></div>
      <svg class="c4a-robot-svg c4a-robot-floating" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="translate(6,6)">
          <rect x="6" y="14" width="60" height="44" rx="10" fill="#071827" stroke="rgba(0,220,255,0.12)" />
          <g transform="translate(18,22)">
            <circle class="c4a-eye" cx="8" cy="8" r="6" />
            <circle class="c4a-eye" cx="32" cy="8" r="6" />
            <rect x="2" y="28" width="40" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
          </g>
        </g>
      </svg>
      <div class="c4a-bubble">Hi! I'm C4-Bot. How can I help you today?</div>
    </button>
  `
  root.className = 'c4-robot-wrap'
  document.body.appendChild(root)

  // references
  const panel = root.querySelector('.c4a-panel')
  const btn = root.querySelector('.c4a-robot-btn')
  const bubble = root.querySelector('.c4a-bubble')
  const messages = root.querySelector('.c4a-chat-messages')
  const input = root.querySelector('.c4a-input input')
  const sendBtn = root.querySelector('.c4a-send')

  // touch-action: left to CSS for default; mobile CSS may set `none` so
  // the element captures gestures reliably. We avoid forcing inline
  // touch-action here so stylesheet rules can take precedence.
  try { btn.style.zIndex = btn.style.zIndex || '100000'; } catch (err) { /* ignore */ }

  // Dragging state for the floating bot
  let dragState = {
    pointerId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    moved: false,
    active: false
  }
  let suppressClick = false
  const DRAG_THRESHOLD = 10
  // touch long-press removed to avoid blocking vertical scroll; require stronger horizontal gesture

  function prepareForDrag(clientX, clientY){
    const rect = btn.getBoundingClientRect()
    // switch to fixed left/top positioning so we can move freely
    // use setProperty with priority to override any !important mobile rules
    btn.style.setProperty('position', 'fixed', 'important')
    btn.style.setProperty('right', 'auto', 'important')
    btn.style.setProperty('bottom', 'auto', 'important')
    btn.style.setProperty('left', rect.left + 'px', 'important')
    btn.style.setProperty('top', rect.top + 'px', 'important')
    btn.style.setProperty('transform', 'none', 'important')
    // mark initial anchor for transform-based dragging
    dragState.initialLeft = rect.left
    dragState.initialTop = rect.top
    dragState.lastDx = 0
    dragState.lastDy = 0
    try { btn.style.setProperty('will-change', 'transform', 'important') } catch(_){}
    btn.style.zIndex = '2147483647'
  }

  // persist / restore position so mobile/desktop keep the last user placement
  function persistPosition(left, top){
    try{ localStorage.setItem('c4_assistant_pos', Math.round(left) + ',' + Math.round(top)) } catch(e){}
  }

  function restorePosition(){
    try{
      const val = localStorage.getItem('c4_assistant_pos')
      if(!val) return
      const parts = val.split(',')
      if(parts.length !== 2) return
      const l = Number(parts[0])
      const t = Number(parts[1])
      if(isNaN(l) || isNaN(t)) return
      // apply fixed inline position
      btn.style.setProperty('position','fixed','important')
      btn.style.setProperty('right','auto','important')
      btn.style.setProperty('bottom','auto','important')
      btn.style.setProperty('left', l + 'px','important')
      btn.style.setProperty('top', t + 'px','important')
      btn.style.setProperty('transform','none','important')
    } catch(e){}
  }

  // ensure stored position stays inside viewport on resize
  window.addEventListener('resize', ()=>{
    try{
      const val = localStorage.getItem('c4_assistant_pos')
      if(!val) return
      const [l,t] = val.split(',').map(Number)
      if(isNaN(l) || isNaN(t)) return
      const vw = window.innerWidth, vh = window.innerHeight
      const rect = btn.getBoundingClientRect()
      const w = rect.width || 84, h = rect.height || 84
      const clampedLeft = Math.max(8, Math.min(l, vw - w - 8))
      const clampedTop = Math.max(8, Math.min(t, vh - h - 8))
      if(clampedLeft !== l || clampedTop !== t){
        persistPosition(clampedLeft, clampedTop)
        btn.style.setProperty('left', clampedLeft + 'px','important')
        btn.style.setProperty('top', clampedTop + 'px','important')
      }
    } catch(_){}
  })

  // restore on init
  restorePosition()

  function onPointerDown(e){
    // only react to primary buttons/touches
    if (e.button && e.button !== 0) return
    dragState.pointerId = e.pointerId
    dragState.startX = e.clientX
    dragState.startY = e.clientY
    const rect = btn.getBoundingClientRect()
    dragState.offsetX = e.clientX - rect.left
    dragState.offsetY = e.clientY - rect.top
    dragState.moved = false
    dragState.active = false
    // remember input type so we can treat touch vs mouse differently
    try { dragState.inputType = e.pointerType || 'mouse' } catch(_) { dragState.inputType = 'mouse' }

    // attach pointer listeners; ensure pointermove is non-passive so we can
    // call preventDefault() when a drag is active (needed on mobile)
    try { btn.setPointerCapture && btn.setPointerCapture(e.pointerId) } catch(_){ }
    try { document.addEventListener('pointermove', onPointerMove, { passive: false }) } catch(err){ document.addEventListener('pointermove', onPointerMove) }
    try { document.addEventListener('pointerup', onPointerUp, { passive: true }) } catch(err){ document.addEventListener('pointerup', onPointerUp) }
    try { document.addEventListener('pointercancel', onPointerUp, { passive: true }) } catch(err){ document.addEventListener('pointercancel', onPointerUp) }
  }

  function onPointerMove(e){
    if (dragState.pointerId !== e.pointerId) return
    const dx = e.clientX - dragState.startX
    const dy = e.clientY - dragState.startY
    // wait until user has moved enough before deciding; require a mostly-horizontal
    // gesture to begin dragging so vertical swipes still scroll the page.
    if (!dragState.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
      // mark that movement has started
      dragState.moved = true
      // if this is a touch input, require a mostly-horizontal gesture to begin
      const isTouch = dragState.inputType === 'touch' || dragState.inputType === 'pen'
      if (isTouch){
        const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > DRAG_THRESHOLD
        if (isHorizontal && !dragState.active){
          // start dragging on a deliberate horizontal gesture
          dragState.active = true
          btn.classList.add('dragging')
          try { btn.setPointerCapture && btn.setPointerCapture(e.pointerId) } catch (err) { /* ignore */ }
          prepareForDrag(e.clientX, e.clientY)
          try { btn.style.setProperty('touch-action', 'none', 'important') } catch(_){ }
        } else {
          // vertical or ambiguous gesture: don't start drag and allow native scrolling
          return
        }
      } else {
        // mouse or other non-touch pointers: start dragging once threshold passed
        dragState.active = true
        btn.classList.add('dragging')
        try { btn.setPointerCapture && btn.setPointerCapture(e.pointerId) } catch (err) { /* ignore */ }
        prepareForDrag(e.clientX, e.clientY)
        try { btn.style.setProperty('touch-action', 'none', 'important') } catch(_){ }
        try { e.preventDefault && e.preventDefault() } catch(_){ }
      }
    }

    if (dragState.active) {
      // prevent page scroll while actively dragging
      e.preventDefault()
      const leftTarget = e.clientX - dragState.offsetX
      const topTarget = e.clientY - dragState.offsetY
      const vw = window.innerWidth
      const vh = window.innerHeight
      const rect = btn.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const clampedLeft = Math.max(8, Math.min(leftTarget, vw - w - 8))
      const clampedTop = Math.max(8, Math.min(topTarget, vh - h - 8))
      const dx = clampedLeft - (dragState.initialLeft || 0)
      const dy = clampedTop - (dragState.initialTop || 0)
      dragState.lastDx = dx
      dragState.lastDy = dy
      // move visually via transform for smooth GPU-accelerated motion
      btn.style.setProperty('transform', 'translate3d(' + dx + 'px,' + dy + 'px,0)', 'important')
      suppressClick = true
    }
  }

  function onPointerUp(e){
    if (dragState.pointerId !== e.pointerId){ cleanupPointerListeners(); return }
    if (dragState.active && dragState.moved){
      // finish drag
      btn.classList.remove('dragging')
      try { btn.releasePointerCapture && btn.releasePointerCapture(e.pointerId) } catch (err) { /* ignore */ }
      // compute final absolute position and persist it (remove transform)
      const finalLeft = Math.round((dragState.initialLeft || 0) + (dragState.lastDx || 0))
      const finalTop = Math.round((dragState.initialTop || 0) + (dragState.lastDy || 0))
      try { btn.style.setProperty('transform', 'none', 'important') } catch(_){}
      try { btn.style.setProperty('left', finalLeft + 'px', 'important') } catch(_){}
      try { btn.style.setProperty('top', finalTop + 'px', 'important') } catch(_){}
      try { btn.style.removeProperty('touch-action') } catch(_){ }
      try { persistPosition(finalLeft, finalTop) } catch(_){ }
      // leave the inline left/top so position persists visually
      // briefly suppress the following click that pointerup may trigger
      suppressClick = true
      setTimeout(()=> { suppressClick = false }, 50)
    }
    cleanupPointerListeners()
  }

  function cleanupPointerListeners(){
    try { document.removeEventListener('pointermove', onPointerMove) } catch(err){}
    try { document.removeEventListener('pointerup', onPointerUp) } catch(err){}
    try { document.removeEventListener('pointercancel', onPointerUp) } catch(err){}
    try { btn.style.removeProperty('touch-action') } catch(_){ }
    dragState.pointerId = null
    dragState.active = false
    dragState.moved = false
  }

  // attach pointerdown for drag behavior (non-passive where supported)
  try { btn.addEventListener('pointerdown', onPointerDown, { passive: false }) } catch(e){ btn.addEventListener('pointerdown', onPointerDown) }

  // Touch fallback for browsers that don't support Pointer Events (iOS Safari older versions)
  if (typeof window.PointerEvent === 'undefined'){
    let touchDrag = { startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false, active: false }

    function onTouchStart(ev){
      if(!ev.touches || ev.touches.length !== 1) return
      const t = ev.touches[0]
      touchDrag.startX = t.clientX
      touchDrag.startY = t.clientY
      const rect = btn.getBoundingClientRect()
      touchDrag.offsetX = t.clientX - rect.left
      touchDrag.offsetY = t.clientY - rect.top
      touchDrag.moved = false
      touchDrag.active = false
    }

    function onTouchMove(ev){
      if(!ev.touches || ev.touches.length !== 1) return
      const t = ev.touches[0]
      const dx = t.clientX - touchDrag.startX
      const dy = t.clientY - touchDrag.startY

      if(!touchDrag.moved){
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        touchDrag.moved = true
          if(Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > DRAG_THRESHOLD){
          // horizontal: start drag
          touchDrag.active = true
          btn.classList.add('dragging')
          prepareForDrag(t.clientX, t.clientY)
            try { btn.style.setProperty('touch-action', 'none', 'important') } catch(_){ }
          // prevent default to avoid the browser stealing the gesture
          ev.preventDefault()
        } else {
          // vertical or ambiguous: allow page scroll
          return
        }
      }

      if(touchDrag.active){
        ev.preventDefault()
        const leftTarget = t.clientX - touchDrag.offsetX
        const topTarget = t.clientY - touchDrag.offsetY
        const vw = window.innerWidth
        const vh = window.innerHeight
        const rect = btn.getBoundingClientRect()
        const w = rect.width
        const h = rect.height
        const clampedLeft = Math.max(8, Math.min(leftTarget, vw - w - 8))
        const clampedTop = Math.max(8, Math.min(topTarget, vh - h - 8))
        const dx2 = clampedLeft - (dragState.initialLeft || 0)
        const dy2 = clampedTop - (dragState.initialTop || 0)
        dragState.lastDx = dx2
        dragState.lastDy = dy2
        btn.style.setProperty('transform', 'translate3d(' + dx2 + 'px,' + dy2 + 'px,0)', 'important')
        suppressClick = true
      }
    }

    function onTouchEnd(ev){
      if(touchDrag.active){
          btn.classList.remove('dragging')
          // persist final position
          const finalLeftT = Math.round((dragState.initialLeft || 0) + (dragState.lastDx || 0))
          const finalTopT = Math.round((dragState.initialTop || 0) + (dragState.lastDy || 0))
          try { btn.style.setProperty('transform', 'none', 'important') } catch(_){}
          try { btn.style.setProperty('left', finalLeftT + 'px', 'important') } catch(_){}
          try { btn.style.setProperty('top', finalTopT + 'px', 'important') } catch(_){}
          try { btn.style.removeProperty('touch-action') } catch(_){ }
          try { persistPosition(finalLeftT, finalTopT) } catch(_){ }
          suppressClick = true
          setTimeout(()=> { suppressClick = false }, 50)
        }
      touchDrag.moved = false
      touchDrag.active = false
    }

    btn.addEventListener('touchstart', onTouchStart, { passive: true })
    btn.addEventListener('touchmove', onTouchMove, { passive: false })
    btn.addEventListener('touchend', onTouchEnd)
    btn.addEventListener('touchcancel', onTouchEnd)
  }

  // helper to add message
  function addMessage(from, text){
    const el = document.createElement('div')
    el.className = 'c4a-msg ' + (from === 'user' ? 'user':'bot')
    el.textContent = text
    messages.appendChild(el)
    messages.scrollTop = messages.scrollHeight
  }

  // Knowledge base for C4-Bot (company info, services, FAQ)
  const C4_KB = {
    companyName: 'Code4',
    tagline: 'Code the Future',
    website: 'www.code4dev.vercel.app',
    email: 'we.code4@gmail.com',
    description: 'Code4 is a software development, cybersecurity, and data solutions company that helps businesses build, secure, and scale digital products. We also provide coding and AI training through Code4 Academy.',
    services: [
      'Custom Software & Web/Mobile Applications: Build tailored backend systems, responsive websites, SaaS platforms, and cross-platform mobile apps.',
      'Cybersecurity: Protect systems, networks, and sensitive data through security assessments, secure architecture, vulnerability scanning, and monitoring.',
      'Cloud Solutions: Scalable infrastructure, cloud migration, automation, backup, and disaster recovery.',
      'Data Analysis: Data pipelines, analytics, dashboards, visualization, and actionable insights for better decision-making.',
      'Code4 Academy: Hands-on courses in coding, software development, AI training, and data analysis.',
      'DevOps & QA Testing: CI/CD pipelines, automated deployment, performance testing, and quality assurance.'
    ],
    industries: ['Education','Healthcare','Finance','Retail','Logistics','Real Estate','Government','Startups','Nonprofits'],
    portfolio: [
      { title: 'E-Commerce Platform', desc: 'Scalable shopping platform with secure payments.', tech: 'PHP (Laravel • CodeIgniter), JavaScript' },
      { title: 'School Management System', desc: 'Administrative tools and parent/student portals.', tech: 'PHP (Laravel • CodeIgniter), JavaScript' },
      { title: 'Cybersecurity Dashboard', desc: 'Real-time monitoring and threat analytics.', tech: 'TypeScript, Node.js' },
      { title: 'AI Business Assistant', desc: 'AI-driven insights and automated workflows.', tech: 'Python, FastAPI, GPT' }
    ],
    faqs: {
      services: 'We offer custom software development, web and mobile applications, cybersecurity, cloud solutions, data analysis, Code4 Academy training, and DevOps with QA testing.',
      cyber: 'Yes. We help protect systems, networks, and sensitive data through security assessments, testing, and monitoring.',
      data: 'Yes. We build data pipelines, dashboards, and visualizations that help businesses make informed decisions.',
      academy: 'Code4 Academy provides hands-on courses in coding, software development, AI, and data analysis.',
      custom: 'Absolutely. We design and develop secure, scalable solutions tailored to your needs.',
      contact: 'You can reach us at we.code4@gmail.com or visit www.code4dev.vercel.app.',
      cost: 'Pricing depends on scope, features, integrations, and timelines. Contact us for a tailored proposal.',
      timeline: 'Timelines range from a few weeks for smaller projects to several months for large-scale platforms.'
    },
    quickResponses: {
      services: 'We specialize in custom software development, web and mobile applications, cybersecurity, cloud solutions, data analysis, Code4 Academy, and DevOps with QA testing.',
      cybersecurity: 'We protect your systems, networks, and data through assessments, secure architecture, and monitoring.',
      dataAnalysis: 'We transform data into actionable insights using analytics, dashboards, and visualizations.',
      academy: 'We provide practical training in coding, software development, AI, and data analysis through Code4 Academy.',
      portfolio: 'We have built e-commerce platforms, school management systems, cybersecurity dashboards, and AI business assistants.',
      contact: 'You can reach us at we.code4@gmail.com or visit www.code4dev.vercel.app.'
    },
    ctas: [
      "Let's discuss your project.",
      'Request a free consultation.',
      'Contact Code4 today.',
      'Get a tailored proposal.',
      'Build something great together.'
    ]
  }

  function canned(text){
    const t = (text || '').toLowerCase();
    if(!t) return C4_KB.quickResponses.services;
    if(t.includes('service') || t.includes('what do you offer') || t.includes('what services') || t.includes('what do you offer')) return C4_KB.quickResponses.services;
    if(t.includes('cyber')) return C4_KB.quickResponses.cybersecurity;
    if(t.includes('data analysis') || t.includes('data') || t.includes('analytics')) return C4_KB.quickResponses.dataAnalysis;
    if(t.includes('academy') || t.includes('training')) return C4_KB.quickResponses.academy;
    if(t.includes('portfolio') || t.includes('projects') || t.includes('work')) return C4_KB.quickResponses.portfolio;
    if(t.includes('contact') || t.includes('email') || t.includes('reach')) return C4_KB.quickResponses.contact;
    if(t.includes('how much') || t.includes('cost') || t.includes('price')) return C4_KB.faqs.cost;
    if(t.includes('how long') || t.includes('timeline') || t.includes('time')) return C4_KB.faqs.timeline;
    if(t.includes('industr') || t.includes('industry')) return 'We serve: ' + C4_KB.industries.join(', ');
    if(t.includes('about') || t.includes('who are you') || t.includes('company')) return C4_KB.description;
    for(const k in C4_KB.faqs){ if(t.includes(k)) return C4_KB.faqs[k]; }
    return `I'm sorry — I don't want to guess. Please email us at ${C4_KB.email} or visit ${C4_KB.website} for detailed help.`
  }

  // initial bubble show then auto-hide
  setTimeout(()=> bubble.classList.add('show'), 700)
  setTimeout(()=> bubble.classList.remove('show'), 4200)

  // blink animation
  function blinkOnce(){
    const eyes = root.querySelectorAll('.c4a-eye')
    eyes.forEach(e => e.classList.add('blinked'))
    setTimeout(()=> eyes.forEach(e => e.classList.remove('blinked')), 180)
  }
  setInterval(()=>{ if(Math.random() > 0.45) blinkOnce() }, 2800)

  // wave animation (small rotation of svg)
  btn.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0deg)' }], { duration: 1200, easing: 'ease', iterations: 1 })

  // toggle panel
  function openPanel(){ panel.hidden = false; panel.classList.add('show'); panel.querySelector('[data-c4-close]').focus(); }
  function closePanel(){ panel.classList.remove('show'); setTimeout(()=> panel.hidden = true, 220) }

  btn.addEventListener('click', (e)=>{ 
    if(suppressClick){ e.stopPropagation(); e.preventDefault(); suppressClick = false; return }
    e.stopPropagation(); 
    try {
      if(panel && panel.hidden) openPanel(); else if(panel) closePanel();
    } catch (err) {
      console.error('C4Assistant: failed to toggle panel', err);
      try { if(panel){ panel.hidden = false; panel.classList.add('show'); } } catch(_){}
    }
  })
  root.querySelector('[data-c4-close]').addEventListener('click', closePanel)

  // quick actions
  root.querySelectorAll('.c4a-quick-btn').forEach(b => b.addEventListener('click', function(){ const txt = this.textContent.trim(); addMessage('user', txt); setTimeout(()=> addMessage('bot', canned(txt)), 800) }))

  // send
  sendBtn.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; addMessage('user', v); input.value = ''; setTimeout(()=> addMessage('bot', canned(v)), 700) })
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); sendBtn.click() } })

  // small head following using mousemove
  window.addEventListener('mousemove', (ev)=>{
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width/2
    const cy = rect.top + rect.height/2
    const dx = (ev.clientX - cx) / window.innerWidth
    const dy = (ev.clientY - cy) / window.innerHeight
    const eyes = root.querySelectorAll('.c4a-eye')
    eyes.forEach(e => { e.style.transform = `translate(${dx*8}px, ${dy*6}px)` })
  })

  // accessibility: close on outside click
  document.addEventListener('click', (ev)=>{ if(!root.contains(ev.target)){ if(!panel.hidden) closePanel() } })

  // Optional on-screen debug overlay (enable with ?c4debug=1 or
  // localStorage.setItem('c4_assistant_debug','1')) — useful for testing on mobile
  try {
    const debugEnabled = (location.search || '').indexOf('c4debug=1') > -1 || localStorage.getItem('c4_assistant_debug') === '1'
    if(debugEnabled){
      const dbg = document.createElement('div')
      dbg.id = 'c4-debug-overlay'
      dbg.style.cssText = 'position:fixed;left:8px;top:8px;z-index:2147483650;background:rgba(0,0,0,0.6);color:#0ff;padding:8px 10px;border-radius:8px;font-family:monospace;font-size:12px;max-width:48vw;pointer-events:none;opacity:0.95'
      document.body.appendChild(dbg)
      let tId = 0
      function showDebug(msg){ if(!dbg) return; dbg.textContent = msg; clearTimeout(tId); tId = setTimeout(()=> dbg.textContent = '', 2500) }
      // pointer events
      btn.addEventListener('pointerdown', (e)=> showDebug('pointerdown '+ (e.pointerType||'') + ' @' + e.clientX + ',' + e.clientY))
      document.addEventListener('pointermove', (e)=> showDebug('pointermove '+ (e.pointerType||'') + ' @' + e.clientX + ',' + e.clientY))
      document.addEventListener('pointerup', (e)=> showDebug('pointerup '+ (e.pointerType||'') + ' @' + e.clientX + ',' + e.clientY))
      // touch fallback
      btn.addEventListener('touchstart', (e)=> { const t = e.touches && e.touches[0]; if(t) showDebug('touchstart @' + t.clientX + ',' + t.clientY) }, { passive: true })
      document.addEventListener('touchmove', (e)=> { const t = e.touches && e.touches[0]; if(t) showDebug('touchmove @' + t.clientX + ',' + t.clientY) }, { passive: true })
      document.addEventListener('touchend', (e)=> showDebug('touchend'))
    }
  } catch(_){}

  // expose for debugging
  window.C4Assistant = { root }

})()
