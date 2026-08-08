/* Kashmiri Gold — shared site script */

/* current year in footer */
document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* mobile nav */
const burger = document.querySelector('.nav__burger');
const drawer = document.querySelector('.nav__drawer');
if (burger && drawer) {
  burger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

/* scroll reveals */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = document.querySelectorAll('.rise');
if ('IntersectionObserver' in window && !reduce) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), i * 90);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add('in'));
}

/* cookie notice — no tracking scripts load until consent */
const bar = document.querySelector('.cookie');
if (bar) {
  let stored = null;
  try { stored = localStorage.getItem('kg-cookie-choice'); } catch (e) { stored = null; }
  if (!stored) bar.classList.add('show');

  bar.querySelectorAll('[data-cookie]').forEach(btn => {
    btn.addEventListener('click', () => {
      try { localStorage.setItem('kg-cookie-choice', btn.dataset.cookie); } catch (e) {}
      bar.classList.remove('show');
    });
  });
}



/* ---- cursor bloom, desktop only ---- */
if (!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'glow';
  document.body.appendChild(glow);
  let gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy, raf = null;

  const render = () => {
    cx += (gx - cx) * 0.09;
    cy += (gy - cy) * 0.09;
    glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5) {
      raf = requestAnimationFrame(render);
    } else { raf = null; }
  };

  window.addEventListener('pointermove', (e) => {
    gx = e.clientX; gy = e.clientY;
    glow.classList.add('on');
    if (!raf) raf = requestAnimationFrame(render);
  }, { passive: true });

  document.addEventListener('pointerleave', () => glow.classList.remove('on'));
}

/* ---- marquee: driven by requestAnimationFrame ----
   CSS animations get killed outright by OS-level "reduce animations"
   settings, which silently freezes the banner. Driving it here keeps it
   moving at a constant 46px/sec regardless of viewport or CSS state. ---- */
document.querySelectorAll('.marquee').forEach(m => {
  const track = m.querySelector('.marquee__track');
  if (!track) return;

  track.style.animation = 'none';          // take CSS out of the equation

  let offset = 0, half = 0, last = null, raf = null;
  const SPEED = 46;                        // pixels per second

  const measure = () => { half = track.scrollWidth / 2; };

  const step = (now) => {
    if (last === null) last = now;
    const dt = Math.min((now - last) / 1000, 0.05);   // clamp after tab switch
    last = now;
    if (half > 0) {
      offset = (offset + SPEED * dt) % half;
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    }
    raf = requestAnimationFrame(step);
  };

  const start = () => { if (!raf) { last = null; raf = requestAnimationFrame(step); } };
  const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);

  // pause when the tab is hidden or the strip is scrolled past — saves battery
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()))
      .observe(m);
  } else { start(); }
  start();
});

/* ---- scroll progress ---- */
const prog = document.getElementById('progress');
if (prog) {
  let ticking = false;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ---- nav solidifies once you leave the hero ---- */
const navEl = document.querySelector('.nav');
if (navEl) {
  const onScroll = () => navEl.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- close the mobile drawer on navigation or resize ---- */
if (drawer) {
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 940) {
      drawer.classList.remove('open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---- count the stat numbers up as they arrive ---- */
if (!reduce && 'IntersectionObserver' in window) {
  const nums = document.querySelectorAll('[data-count]');
  const numObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const started = performance.now();
      const tick = (now) => {
        const p = Math.min((now - started) / 1400, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-GB');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      numObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => numObs.observe(n));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* waitlist */
const wl = document.getElementById('waitlistForm');
if (wl) {
  const msg = document.getElementById('waitlistMsg');
  const btn = wl.querySelector('button');

  wl.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (wl.company.value) return;                    // honeypot

    const email = wl.email.value.trim();
    if (!EMAIL_RE.test(email)) {
      msg.textContent = 'That email address doesn\u2019t look right. Check it and try again.';
      return;
    }

    btn.disabled = true;
    msg.textContent = 'Adding you\u2026';

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: window.location.pathname })
      });

      if (res.ok) {
        wl.reset();
        msg.textContent = 'You\u2019re on the list. We\u2019ll write when the first harvest lands.';
      } else if (res.status === 409) {
        wl.reset();
        msg.textContent = 'You\u2019re already on the list \u2014 nothing more to do.';
      } else {
        msg.textContent = 'We couldn\u2019t add you just then. Try again in a moment.';
      }
    } catch (err) {
      msg.textContent = 'We couldn\u2019t reach the server. Check your connection and try again.';
    } finally {
      btn.disabled = false;
    }
  });
}

/* contact */
const cf = document.getElementById('contactForm');
if (cf) {
  const msg = document.getElementById('contactMsg');
  const btn = cf.querySelector('button');

  cf.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (cf.company.value) return;                    // honeypot

    const name = cf.name.value.trim();
    const email = cf.email.value.trim();
    const message = cf.message.value.trim();

    if (!name)                  { msg.textContent = 'Add your name so we know who we\u2019re replying to.'; return; }
    if (!EMAIL_RE.test(email))  { msg.textContent = 'That email address doesn\u2019t look right.'; return; }
    if (message.length < 10)    { msg.textContent = 'Tell us a little more so we can answer properly.'; return; }

    btn.disabled = true;
    msg.textContent = 'Sending\u2026';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject: cf.subject.value, message })
      });

      if (res.ok) {
        cf.reset();
        msg.textContent = 'Thanks \u2014 that\u2019s with us. We reply within two working days.';
      } else {
        msg.textContent = 'That didn\u2019t send. Email andrew@vitacomhealth.com directly and we\u2019ll pick it up.';
      }
    } catch (err) {
      msg.textContent = 'That didn\u2019t send. Email andrew@vitacomhealth.com directly and we\u2019ll pick it up.';
    } finally {
      btn.disabled = false;
    }
  });
}