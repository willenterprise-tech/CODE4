document.addEventListener('DOMContentLoaded', function(){
  const storageKey = 'c4_animations_disabled';
  const phoneLayout = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let savedPreference = null;
  try { savedPreference = localStorage.getItem(storageKey); } catch {}
  let animationsDisabled = savedPreference === null ? reducedMotion.matches : savedPreference === 'true';
  const toggleBtn = document.getElementById('toggle-animations');

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
    s.style.color = 'var(--cyan)';
    s.style.pointerEvents = 'none';
    s.setAttribute('aria-hidden', 'true');
    s.style.transform = 'translate(-50%, -50%) rotate(' + (Math.random()*40-20) + 'deg)';
    s.textContent = Math.random()>0.6?'{ }':'< />';
    hero.appendChild(s);
    setTimeout(()=>{ s.style.transition = 'opacity 1s'; s.style.opacity = '0'; }, 9000);
    setTimeout(()=>{ s.remove(); }, 11000);
  }

  function startSymbols(){
    if(!hero) return;
    stopSymbols();
    const compact = phoneLayout.matches;
    for(let i=0;i<(compact ? 4 : 10);i++) spawnSymbol();
    symbolInterval = setInterval(spawnSymbol, compact ? 2400 : 1100);
  }
  function stopSymbols(){
    if(symbolInterval){ clearInterval(symbolInterval); symbolInterval = null; }
    document.querySelectorAll('.floater').forEach(f=>f.remove());
  }

  function initParticles(){
    const canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    document.body.appendChild(canvas);
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let rafId = null;
    let particles = [];

    function resize(){ width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);

    function rand(min, max){ return Math.random()*(max-min)+min }
    const deviceFactor = phoneLayout.matches ? 0.7 : 1;
    const desiredCount = phoneLayout.matches ? Math.round(width / 12) : Math.floor(60 + width / 30);
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
    document.body.classList.add('animations-enabled');
    if('IntersectionObserver' in window) startReveal();
    startSymbols();
    startParticles();
    if(toggleBtn){
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.classList.add('active');
      const st = toggleBtn.querySelector('.status-text'); if(st) st.textContent = 'On';
    }
  }
  function stopAnimations(){
    document.body.classList.remove('animations-enabled');
    document.body.classList.add('animations-disabled');
    stopSymbols();
    stopParticles();
    stopReveal();
    if(toggleBtn){
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.classList.remove('active');
      const st = toggleBtn.querySelector('.status-text'); if(st) st.textContent = 'Off';
    }
  }

  // initialize
  if(animationsDisabled) stopAnimations(); else startAnimations();

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(){
      animationsDisabled = !animationsDisabled;
      savedPreference = String(animationsDisabled);
      try { localStorage.setItem(storageKey, savedPreference); } catch {}
      if(animationsDisabled) stopAnimations(); else startAnimations();
    });
  }
  phoneLayout.addEventListener('change', function(){
    if(!animationsDisabled){
      startSymbols();
      startParticles();
    }
  });
  reducedMotion.addEventListener('change', function(){
    if(savedPreference !== null) return;
    animationsDisabled = reducedMotion.matches;
    if(animationsDisabled) stopAnimations(); else startAnimations();
  });

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
      const mailtoHref = 'mailto:we.code4@gmail.com?subject=' + encodeURIComponent('G3 Labs website contact: ' + nameVal) + '&body=' + encodeURIComponent(bodyText);

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

  // Homepage Wenix gallery.
  const gallery = document.querySelector('.wenix-gallery');
  if(gallery){
    const preview = gallery.querySelector('.wenix-preview');
    const mainImage = gallery.querySelector('.wenix-main');
    const controls = gallery.querySelector('.wenix-controls');
    const rail = gallery.querySelector('.wenix-thumbnails');
    const title = gallery.querySelector('.wenix-caption-title');
    const count = gallery.querySelector('.wenix-count');
    const thumbnails = Array.from(rail.querySelectorAll('.wenix-thumb'));

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrevious = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    let selected = 0;
    let viewerIndex = 0;

    function wrapIndex(index){
      return (index + thumbnails.length) % thumbnails.length;
    }

    function selectSlide(index){
      const next = wrapIndex(index);
      const button = thumbnails[next];
      thumbnails[selected].setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      selected = next;

      const label = button.getAttribute('aria-label');
      mainImage.src = button.querySelector('img').src;
      mainImage.alt = label;
      title.textContent = label;
      count.textContent = (selected + 1) + ' of ' + thumbnails.length;

      const stripBounds = rail.getBoundingClientRect();
      const buttonBounds = button.getBoundingClientRect();
      if(buttonBounds.left < stripBounds.left || buttonBounds.right > stripBounds.right){
        rail.scrollLeft += buttonBounds.left - stripBounds.left - 4;
      }
    }

    function showViewerSlide(index){
      viewerIndex = wrapIndex(index);
      const button = thumbnails[viewerIndex];
      lightboxImage.src = button.querySelector('img').src;
      lightboxImage.alt = button.getAttribute('aria-label');
      lightboxCaption.textContent = lightboxImage.alt + ' (' + (viewerIndex + 1) + ' of ' + thumbnails.length + ')';
    }

    function closeViewer(){
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('wenix-viewer-open');
      lightboxImage.removeAttribute('src');
      preview.focus({preventScroll: true});
    }

    thumbnails.forEach((button, index) => {
      button.addEventListener('click', () => selectSlide(index));
    });
    controls.querySelector('.wenix-prev').addEventListener('click', () => selectSlide(selected - 1));
    controls.querySelector('.wenix-next').addEventListener('click', () => selectSlide(selected + 1));

    // Only the large image changes slides on a swipe. The thumbnail rail scrolls normally.
    let touchOrigin = null;
    preview.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      touchOrigin = event.touches.length === 1 ? {x: touch.clientX, y: touch.clientY} : null;
    }, {passive: true});
    preview.addEventListener('touchcancel', () => { touchOrigin = null; });
    preview.addEventListener('touchend', event => {
      const origin = touchOrigin;
      touchOrigin = null;
      if(!origin || event.touches.length) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      if(Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      if(event.cancelable) event.preventDefault();
      selectSlide(selected + (dx < 0 ? 1 : -1));
    }, {passive: false});

    preview.addEventListener('click', () => {
      showViewerSlide(selected);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('wenix-viewer-open');
      lightboxClose.focus();
    });
    lightboxClose.addEventListener('click', closeViewer);
    lightboxPrevious.addEventListener('click', () => showViewerSlide(viewerIndex - 1));
    lightboxNext.addEventListener('click', () => showViewerSlide(viewerIndex + 1));
    lightbox.addEventListener('click', event => {
      if(event.target === lightbox) closeViewer();
    });
    lightbox.addEventListener('keydown', event => {
      if(event.key === 'Escape') closeViewer();
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
        event.preventDefault();
        showViewerSlide(viewerIndex + (event.key === 'ArrowLeft' ? -1 : 1));
      }
      if(event.key === 'Tab' && event.shiftKey && document.activeElement === lightboxClose){
        event.preventDefault();
        lightboxNext.focus();
      } else if(event.key === 'Tab' && !event.shiftKey && document.activeElement === lightboxNext){
        event.preventDefault();
        lightboxClose.focus();
      }
    });

    controls.hidden = false;
    rail.hidden = false;
    preview.disabled = false;
  }

  // Mobile nav toggle: show/hide the collapsed nav on small screens
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if(mobileToggle && navMenu){
    const header = mobileToggle.closest('.site-header');
    function setMobileNav(open){
      navMenu.classList.toggle('open', open);
      mobileToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('mobile-menu-open', open);
    }
    header.classList.add('nav-enhanced');
    mobileToggle.addEventListener('click', function(){
      setMobileNav(!navMenu.classList.contains('open'));
    });
    navMenu.addEventListener('click', function(event){
      if(event.target.closest('a') && navMenu.classList.contains('open')){
        setMobileNav(false);
        mobileToggle.focus({preventScroll:true});
      }
    });
    document.addEventListener('click', function(event){
      if(navMenu.classList.contains('open') && !header.contains(event.target)) setMobileNav(false);
    });
    document.addEventListener('keydown', function(event){
      if(event.key === 'Escape' && navMenu.classList.contains('open')){
        setMobileNav(false);
        mobileToggle.focus({preventScroll:true});
      }
    });
    header.addEventListener('focusout', function(event){
      if(event.relatedTarget && !header.contains(event.relatedTarget)) setMobileNav(false);
    });
    phoneLayout.addEventListener('change', function(){
      if(!phoneLayout.matches) setMobileNav(false);
    });
  }

  // Back-to-top button: appears only when the user scrolled to the bottom of the page
  (function(){
    const THRESHOLD_PX = 8;
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '&#8679;';
    btn.type = 'button';
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      btn.blur();
      var scroller = document.scrollingElement || document.documentElement || document.body;
      // try smooth scroll, fallback to immediate if not supported or if it fails
      try{
        if('scrollBehavior' in document.documentElement.style){
          window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        } else {
          scroller.scrollTop = 0;
        }
      }catch(err){
        scroller.scrollTop = 0;
      }
    });
    btn.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); btn.click(); } });
    document.body.appendChild(btn);

    function checkAtBottom(){
      const docEl = document.documentElement;
      const scrollTop = window.pageYOffset || docEl.scrollTop || document.body.scrollTop || 0;
      const winH = window.innerHeight || docEl.clientHeight;
      const atBottom = (docEl.scrollHeight - (scrollTop + winH)) <= THRESHOLD_PX;
      btn.classList.toggle('visible', atBottom);
    }
    checkAtBottom();
    window.addEventListener('scroll', checkAtBottom, { passive: true });
    window.addEventListener('resize', checkAtBottom);
    if(window.ResizeObserver){
      try{ const ro = new ResizeObserver(checkAtBottom); ro.observe(document.body); } catch(e){ /* ignore */ }
    }
  })();

});
