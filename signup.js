// ─── EMAIL SIGN-UP: POPUP + INLINE BOXES ─────────────────────
// The popup shows on arrival on every page until the visitor signs up.
// Closing it hides it for the current page only. Inline boxes render into
// any element with [data-signup]. Add data-popup="off" to <body> to skip
// the popup on a page.
(() => {
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xppqerrr';
  const SUBSCRIBED_KEY = 'jith_meditation_signup';
  const POPUP_DELAY_MS = 1200;

  const COPY = {
    label: 'A Gift for You',
    title: 'Blessings, and thank you for being curious about yourself.',
    sub: 'Receive The Space Between, a free 10-minute guided meditation, along with occasional reflections on the inward journey.',
    button: 'Send Me the Meditation',
    note: 'No spam. Unsubscribe anytime.',
    success: 'Thank you. Your meditation will arrive in your inbox soon.',
    error: 'Something went wrong. Please try again, or email sachin@sachinbarot.com.',
  };

  const isSubscribed = () => {
    try { return !!localStorage.getItem(SUBSCRIBED_KEY); } catch { return false; }
  };
  const markSubscribed = () => {
    try { localStorage.setItem(SUBSCRIBED_KEY, 'true'); } catch {}
  };

  const cardHTML = () => `
    <div class="section-label">${COPY.label}</div>
    <h3>${COPY.title}</h3>
    <p class="signup-sub">${COPY.sub}</p>
    <form class="signup-form">
      <input type="email" name="email" placeholder="your@email.com" aria-label="Email address" required />
      <input type="text" name="_gotcha" class="signup-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <button type="submit" class="btn btn-primary">${COPY.button}</button>
    </form>
    <p class="signup-error" role="alert" hidden>${COPY.error}</p>
    <p class="signup-note">${COPY.note}</p>
    <p class="signup-success" role="status">${COPY.success}</p>
  `;

  // Sends the email to Formspree; only marks the visitor subscribed if it
  // actually went through, otherwise shows an error so no sign-up is lost.
  const wire = (card, source, onSuccess) => {
    const form = card.querySelector('.signup-form');
    const button = form.querySelector('button');
    const error = card.querySelector('.signup-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.elements._gotcha.value) return;

      const data = new FormData(form);
      data.append('form-type', 'free-meditation-signup');
      data.append('source', source);
      data.append('_subject', 'New sign-up: The Space Between meditation');

      button.disabled = true;
      error.hidden = true;
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (!res.ok) throw new Error(`Formspree ${res.status}`);
        markSubscribed();
        document.querySelectorAll('.signup-card').forEach(c => c.classList.add('submitted'));
        if (onSuccess) onSuccess();
      } catch {
        error.hidden = false;
        button.disabled = false;
      }
    });
  };

  // Inline boxes
  document.querySelectorAll('[data-signup]').forEach(slot => {
    const card = document.createElement('div');
    card.className = 'signup-card';
    card.innerHTML = cardHTML();
    if (isSubscribed()) card.classList.add('submitted');
    slot.appendChild(card);
    wire(card, `${location.pathname} (${slot.dataset.signup})`);
  });

  // Popup
  if (isSubscribed() || document.body.dataset.popup === 'off') return;

  const overlay = document.createElement('div');
  overlay.className = 'email-popup-overlay';
  overlay.innerHTML = `
    <div class="email-popup signup-card" role="dialog" aria-modal="true" aria-label="${COPY.label}">
      <button type="button" class="email-popup-close" aria-label="Close">&times;</button>
      ${cardHTML()}
    </div>
  `;
  document.body.appendChild(overlay);

  const hidePopup = () => overlay.classList.remove('visible');

  overlay.querySelector('.email-popup-close').addEventListener('click', hidePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hidePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hidePopup();
  });

  wire(overlay.querySelector('.signup-card'), `${location.pathname} (popup)`, () => setTimeout(hidePopup, 3000));

  setTimeout(() => overlay.classList.add('visible'), POPUP_DELAY_MS);
})();
