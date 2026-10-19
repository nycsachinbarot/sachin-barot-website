// ─── EMAIL SIGN-UP: POPUP + INLINE BOXES ─────────────────────
// The popup shows on arrival on every page until the visitor signs up.
// Closing it hides it for the current page only. Inline boxes render into
// any element with [data-signup]. Add data-popup="off" to <body> to skip
// the popup on a page.
(() => {
  // Substack's no-JavaScript sign-up endpoint. Forms post into a hidden iframe
  // so the visitor stays on the site and never sees Substack's page.
  const SUBSTACK_ENDPOINT = 'https://sachinbarot.substack.com/api/v1/free?nojs=true';
  const SUBSCRIBED_KEY = 'jith_meditation_signup';
  const POPUP_DELAY_MS = 1200;

  const COPY = {
    label: 'A Gift for You',
    title: 'Blessings, and thank you for being curious about yourself.',
    sub: 'Receive The Space Between, a free 10-minute guided meditation, along with occasional reflections on the inward journey.',
    button: 'Send Me the Meditation',
    note: 'No spam. Unsubscribe anytime.',
    success: 'Thank you. Your meditation will arrive in your inbox soon.',
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
    <form class="signup-form" action="${SUBSTACK_ENDPOINT}" method="post" target="substack-signup">
      <input type="email" name="email" placeholder="your@email.com" aria-label="Email address" required />
      <button type="submit" class="btn btn-primary">${COPY.button}</button>
    </form>
    <p class="signup-note">${COPY.note}</p>
    <p class="signup-success" role="status">${COPY.success}</p>
  `;

  // Lets the form post to Substack (into the hidden iframe), then shows the
  // thank-you message here and stops the popup from returning.
  const wire = (card, onSuccess) => {
    card.querySelector('.signup-form').addEventListener('submit', () => {
      markSubscribed();
      setTimeout(() => {
        document.querySelectorAll('.signup-card').forEach(c => c.classList.add('submitted'));
        if (onSuccess) onSuccess();
      }, 0);
    });
  };

  const frame = document.createElement('iframe');
  frame.name = 'substack-signup';
  frame.title = 'Substack sign-up';
  frame.hidden = true;
  document.body.appendChild(frame);

  // Inline boxes
  document.querySelectorAll('[data-signup]').forEach(slot => {
    const card = document.createElement('div');
    card.className = 'signup-card';
    card.innerHTML = cardHTML();
    if (isSubscribed()) card.classList.add('submitted');
    slot.appendChild(card);
    wire(card);
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

  wire(overlay.querySelector('.signup-card'), () => setTimeout(hidePopup, 3000));

  setTimeout(() => overlay.classList.add('visible'), POPUP_DELAY_MS);
})();
