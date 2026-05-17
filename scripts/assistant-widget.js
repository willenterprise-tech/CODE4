/* C4 Assistant embeddable widget (vanilla JS) */
(function(){
  const rootId = 'c4-assistant'
  if(document.getElementById(rootId)) return

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

  btn.addEventListener('click', (e)=>{ e.stopPropagation(); if(panel.hidden) openPanel(); else closePanel(); })
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

  // expose for debugging
  window.C4Assistant = { root }

})()
