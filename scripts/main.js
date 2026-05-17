document.addEventListener('DOMContentLoaded', function(){
  const storageKey = 'c4_animations_disabled';
  const storedRaw = localStorage.getItem(storageKey);
  const storedDisabled = storedRaw === 'true' ? true : (storedRaw === 'false' ? false : null);
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // If user has previously toggled, use that; otherwise default to OS preference
  let animationsDisabled = storedDisabled !== null ? storedDisabled : prefersReducedMotion;

  const toggleBtn = document.getElementById('toggle-animations');
  if(toggleBtn){
    // support new switch markup: <button> <span.anim-label> <span.anim-switch><span.anim-thumb></span></span> <span.status-text/></button>
    const labelSpan = toggleBtn.querySelector('.anim-label');
    const statusSr = toggleBtn.querySelector('.status-text');
    if(labelSpan) labelSpan.textContent = 'Animations';
    const activeState = !animationsDisabled; // active when animations are enabled
    toggleBtn.setAttribute('aria-pressed', String(animationsDisabled));
    toggleBtn.classList.toggle('active', activeState);
    if(statusSr) statusSr.textContent = activeState ? 'On' : 'Off';
  }

  // state handles
  let symbolInterval = null;
  let particleStop = null;
  let io = null;

  const hero = document.querySelector('.hero');
  function spawnSymbol(){
    if(!hero) return;
    const s = document.createElement('div');
    s.className = 'floater';
    s.style.position = 'absolute';
    s.style.left = Math.random()*100 + '%';
    s.style.top = (10 + Math.random()*70) + '%';
    s.style.opacity = (0.05 + Math.random()*0.25).toString();
    s.style.fontSize = (10 + Math.random()*20) + 'px';
    s.style.color = 'rgba(0,229,255,0.12)';
    s.style.pointerEvents = 'none';
    s.style.transform = 'translate(-50%, -50%) rotate(' + (Math.random()*40-20) + 'deg)';
    s.textContent = Math.random()>0.6?'{ }':'< />';
    hero.appendChild(s);
    setTimeout(()=>{ s.style.transition = 'opacity 1s'; s.style.opacity = '0'; }, 9000);
    setTimeout(()=>{ s.remove(); }, 11000);
  }

  function startSymbols(){
    if(!hero) return;
    stopSymbols();
    for(let i=0;i<10;i++) spawnSymbol();
    symbolInterval = setInterval(spawnSymbol, 1100);
  }
  function stopSymbols(){
    if(symbolInterval){ clearInterval(symbolInterval); symbolInterval = null; }
    document.querySelectorAll('.floater').forEach(f=>f.remove());
  }

  function initParticles(){
    const canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let rafId = null;
    let particles = [];

    function resize(){ width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);

    function rand(min, max){ return Math.random()*(max-min)+min }
    const deviceFactor = window.innerWidth < 720 ? 0.6 : 1;
    const desiredCount = Math.floor(60 * deviceFactor + (width / 30));
    const maxCount = Math.min(120, Math.max(24, desiredCount));

    class Particle{
      constructor(){
        this.x = Math.random()*width; this.y = Math.random()*height; this.r = rand(0.6, 2.6) * deviceFactor; this.vx = rand(-0.3,0.3); this.vy = rand(-0.2,0.2); this.alpha = rand(0.04,0.18);
      }
      update(){ this.x += this.vx; this.y += this.vy; if(this.x < -10) this.x = width + 10; if(this.x > width + 10) this.x = -10; if(this.y < -10) this.y = height + 10; if(this.y > height + 10) this.y = -10; }
      draw(){ ctx.beginPath(); ctx.fillStyle = 'rgba(0,229,255,' + this.alpha + ')'; ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill(); }
    }

    for(let i=0;i<maxCount;i++) particles.push(new Particle());

    function animate(){
      ctx.clearRect(0,0,width,height);
      for(let i=0;i<particles.length;i++){
        const p = particles[i]; p.update(); p.draw();
        for(let j=i+1;j<i+4 && j<particles.length;j++){
          const p2 = particles[j]; const dx = p.x - p2.x, dy = p.y - p2.y; const d = Math.sqrt(dx*dx + dy*dy);
          if(d < 120){ ctx.strokeStyle = 'rgba(0,229,255,' + (0.12*(1 - d/120)).toFixed(3) + ')'; ctx.lineWidth = 0.45; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
        }
      }
      rafId = requestAnimationFrame(animate);
    }
    animate();

    return function stop(){ if(rafId) cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); canvas.remove(); };
  }

  function startParticles(){ stopParticles(); particleStop = initParticles(); }
  function stopParticles(){ if(particleStop){ particleStop(); particleStop = null; } }

  function startReveal(){
    const revealElements = document.querySelectorAll('.card, .project-card, .stat, .feature, .glass, .hero-left, .hero-right, .chart');
    revealElements.forEach(el => { el.classList.add('reveal'); el.classList.remove('show'); });
    io = new IntersectionObserver((entries, obs) => { entries.forEach(entry => { if(entry.isIntersecting){ const el = entry.target; let delay = 0; const parent = el.parentElement; if(parent){ const children = Array.from(parent.children).filter(c => c.matches && c.matches('.card, .project-card, .stat, .feature, .glass, .chart')); const idx = children.indexOf(el); if(idx >= 0) delay = idx * 80; } el.style.setProperty('--delay', delay + 'ms'); el.setAttribute('data-delay', delay + 'ms'); setTimeout(()=> el.classList.add('show'), delay); obs.unobserve(el); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealElements.forEach(el => io.observe(el));
    const heroLeft = document.querySelector('.hero-left'); const heroRight = document.querySelector('.hero-right'); if(heroLeft) setTimeout(()=> heroLeft.classList.add('show'), 120); if(heroRight) setTimeout(()=> heroRight.classList.add('show'), 260);
  }
  function stopReveal(){ if(io){ io.disconnect(); io = null; } const revealElements = document.querySelectorAll('.card, .project-card, .stat, .feature, .glass, .hero-left, .hero-right, .chart'); revealElements.forEach(el => el.classList.add('show')); }

  function startAnimations(){
    document.body.classList.remove('animations-disabled');
    startSymbols();
    startParticles();
    startReveal();
    if(toggleBtn){
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.classList.add('active');
      const st = toggleBtn.querySelector('.status-text'); if(st) st.textContent = 'On';
    }
  }
  function stopAnimations(){
    document.body.classList.add('animations-disabled');
    stopSymbols();
    stopParticles();
    stopReveal();
    if(toggleBtn){
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.classList.remove('active');
      const st = toggleBtn.querySelector('.status-text'); if(st) st.textContent = 'Off';
    }
  }

  // initialize
  if(animationsDisabled) stopAnimations(); else startAnimations();

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(){
      animationsDisabled = !animationsDisabled;
      localStorage.setItem(storageKey, String(animationsDisabled));
      if(animationsDisabled) stopAnimations(); else startAnimations();
    });
  }

  // Contact form: open SMS (mobile) or WhatsApp (desktop) with prefilled content to owner's number; mailto fallback
  const contactForm = document.querySelector('.contact-form');
  if(contactForm){
    const CONTACT_PHONE_RAW = '08149479438'; // owner's phone (provided by user)
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const form = e.currentTarget;
      const nameVal = form.querySelector('[name="name"]').value || '';
      const emailVal = form.querySelector('[name="email"]').value || '';
      const companyVal = form.querySelector('[name="company"]').value || '';
      const messageVal = form.querySelector('[name="message"]').value || '';

      const bodyText = 'Name: ' + nameVal + '\nEmail: ' + emailVal + '\nCompany: ' + companyVal + '\n\n' + messageVal;
      const encoded = encodeURIComponent(bodyText);

      // Normalize provided phone for SMS and WhatsApp links
      let digits = (CONTACT_PHONE_RAW || '').replace(/\D/g, '');
      let smsNumber = digits;
      let waNumber = digits;
      if(digits.length === 11 && digits.charAt(0) === '0'){
        // assume Nigerian local format (0XXXXXXXXXX) -> +234XXXXXXXXX
        smsNumber = '+234' + digits.slice(1);
        waNumber = '234' + digits.slice(1);
      } else if(digits.length >= 10 && digits.startsWith('234')){
        smsNumber = '+' + digits;
        waNumber = digits;
      } else if(digits.length >= 8 && !digits.startsWith('0')){
        // best-effort: treat as international without plus
        smsNumber = '+' + digits;
        waNumber = digits;
      }

      const smsHref = 'sms:' + smsNumber + '?body=' + encoded;
      const waHref = 'https://wa.me/' + waNumber + '?text=' + encoded;
      const mailtoHref = 'mailto:we.code4@gmail.com?subject=' + encodeURIComponent('Code4 website contact: ' + nameVal) + '&body=' + encodeURIComponent(bodyText);

      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      try{
        if(isMobile){
          // open SMS composer on mobile
          window.location.href = smsHref;
        } else {
          // desktop: open WhatsApp web in new tab (good fallback for desktop users)
          window.open(waHref, '_blank');
        }
      }catch(err){
        // final fallback: open mail client
        window.location.href = mailtoHref;
      }
    });
  }

  // Wenix: thumbnail -> main image swap
  (function(){
    const mainImg = document.querySelector('.wenix-main');
    const thumbs = Array.from(document.querySelectorAll('.wenix-thumbs .thumb'));
    if(!mainImg || thumbs.length === 0) return;

    // ensure thumbnails are keyboard accessible and clickable
    thumbs.forEach((t)=>{
      t.setAttribute('tabindex','0');
      t.setAttribute('role','button');
      t.addEventListener('click', ()=> swapTo(t));
      t.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); swapTo(t); } });
    });

    function swapTo(thumb){
      if(thumb.classList.contains('active')) return;
      const newSrc = thumb.getAttribute('src');
      if(!newSrc) return;

      // fade out, swap src, then fade in once loaded
      mainImg.style.transition = mainImg.style.transition || 'opacity .22s ease';
      mainImg.style.opacity = '0';
      const onLoad = function(){
        mainImg.removeEventListener('load', onLoad);
        requestAnimationFrame(()=>{ mainImg.style.opacity = '1'; });
      };
      mainImg.addEventListener('load', onLoad);
      // slight delay to let opacity begin transitioning
      setTimeout(()=> { mainImg.src = newSrc; mainImg.alt = thumb.alt || mainImg.alt || 'Wenix screenshot'; }, 90);

      thumbs.forEach(t=> t.classList.remove('active'));
      thumb.classList.add('active');
    }

    // mark active thumb if it matches initial main src
    thumbs.forEach(t => { if(mainImg.src && t.src && mainImg.src.endsWith(t.src.split('/').pop())) t.classList.add('active'); });

    // Lightbox: open main image in overlay with navigation
    const lightbox = document.getElementById('lightbox');
    const lbImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lbClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lbPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const lbNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    const lbCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;

    const imageList = thumbs.map(t => t.getAttribute('src'));
    let lbIndex = 0;
    function findIndexForSrc(src){
      if(!src) return -1;
      const file = src.split('/').pop();
      return imageList.findIndex(s => s && s.split('/').pop() === file);
    }

    function openLightboxAt(index){
      if(!lightbox || !lbImg || imageList.length === 0) return;
      lbIndex = ((index % imageList.length) + imageList.length) % imageList.length;
      lbImg.style.opacity = '0';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const src = imageList[lbIndex];
      const onLoad = function(){ lbImg.removeEventListener('load', onLoad); requestAnimationFrame(()=> lbImg.style.opacity = '1'); };
      lbImg.addEventListener('load', onLoad);
      lbImg.src = src;
      lbImg.alt = thumbs[lbIndex].alt || '';
      if(lbCaption){ lbCaption.textContent = thumbs[lbIndex].alt || ''; lbCaption.setAttribute('aria-hidden','false'); }
      if(lbClose) lbClose.focus();
    }

    function closeLightbox(){
      if(!lightbox) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if(lbImg) lbImg.src = '';
      if(lbCaption){ lbCaption.setAttribute('aria-hidden','true'); lbCaption.textContent = ''; }
    }

    function showPrev(){ openLightboxAt(lbIndex - 1); }
    function showNext(){ openLightboxAt(lbIndex + 1); }

    if(mainImg){
      mainImg.style.cursor = 'zoom-in';
      mainImg.addEventListener('click', function(){
        const idx = findIndexForSrc(mainImg.src);
        openLightboxAt(idx >= 0 ? idx : 0);
      });
    }

    if(lbClose) lbClose.addEventListener('click', closeLightbox);
    if(lbPrev) lbPrev.addEventListener('click', showPrev);
    if(lbNext) lbNext.addEventListener('click', showNext);

    if(lightbox){
      lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', function(e){
        if(!lightbox.classList.contains('open')) return;
        if(e.key === 'Escape') return closeLightbox();
        if(e.key === 'ArrowLeft'){ e.preventDefault(); return showPrev(); }
        if(e.key === 'ArrowRight'){ e.preventDefault(); return showNext(); }
      });
    }
  })();

});
