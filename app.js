// ─── NAV SCROLL ──────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── MOBILE MENU ─────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen);
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// ─── SMOOTH SCROLL ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── FADE-IN ON SCROLL ───────────────────────────────────────
const fadeEls = document.querySelectorAll(
  '.chapter, .work-card, .quote-card, .testimonial, .article-card, .exp-content, .guest-facilitator'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// ─── APPLICATION FORM ────────────────────────────────────────
const form = document.getElementById('applyForm');
const successMsg = document.getElementById('formSuccess');

// ─── EMAIL CAPTURE POPUP ─────────────────────────────────────
(() => {
  const DISMISS_KEY = 'jith_email_popup_dismissed_at';
  const SUBSCRIBED_KEY = 'jith_email_subscribed';
  const SNOOZE_DAYS = 14;
  const DELAY_MS = 8000;
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mojpqadv';

  if (localStorage.getItem(SUBSCRIBED_KEY)) return;

  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
  const snoozedUntil = dismissedAt + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() < snoozedUntil) return;

  const overlay = document.createElement('div');
  overlay.className = 'email-popup-overlay';
  overlay.innerHTML = `
    <div class="email-popup">
      <button type="button" class="email-popup-close" aria-label="Close">&times;</button>
      <div class="section-label">Stay Connected</div>
      <h3>I am ready to return to myself.</h3>
      <p class="email-popup-sub">
        Reflections on retreats, ceremony, and the inward journey —
        occasionally, and only when there's something worth saying.
      </p>
      <form class="email-popup-form">
        <input type="email" name="email" placeholder="your@email.com" required />
        <button type="submit" class="btn btn-primary">Join</button>
      </form>
      <p class="email-popup-note">No spam. Unsubscribe anytime.</p>
      <p class="email-popup-success">You're in. Welcome to the return.</p>
    </div>
  `;
  document.body.appendChild(overlay);

  const popup = overlay.querySelector('.email-popup');
  const closeBtn = overlay.querySelector('.email-popup-close');
  const popupForm = overlay.querySelector('.email-popup-form');

  const showPopup = () => overlay.classList.add('visible');
  const hidePopup = () => overlay.classList.remove('visible');

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    hidePopup();
  };

  closeBtn.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) dismiss();
  });

  popupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('email', popupForm.querySelector('input[name="email"]').value);
    data.append('form-type', 'email-popup-signup');
    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    }).catch(() => {});

    localStorage.setItem(SUBSCRIBED_KEY, 'true');
    popup.classList.add('submitted');
    setTimeout(hidePopup, 2500);
  });

  setTimeout(showPopup, DELAY_MS);
})();
