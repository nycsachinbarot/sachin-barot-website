// ─── EMAIL SIGN-UP: POPUP + INLINE BOXES ─────────────────────
// Sign-ups go to the "Email List" in Klaviyo, whose welcome flow sends the
// meditation. The popup shows on arrival on every page until the visitor
// signs up; closing it hides it for the current page only. Inline boxes
// render into any element with [data-signup]. Add data-popup="off" to
// <body> to skip the popup on a page. Other pages can call
// window.jithSubscribe() directly (see sweat440.html).
(() => {
  const KLAVIYO_COMPANY_ID = 'VDeL2T';   // public site key, safe to publish
  const KLAVIYO_LIST_ID = 'TWa8TC';      // "Email List"
  const SUBSCRIBED_KEY = 'jith_signup_klaviyo';
  const POPUP_DELAY_MS = 1200;

  const COPY = {
    label: 'A Gift for You',
    title: 'Blessings, and thank you for being curious about yourself.',
    sub: 'Receive The Space Between, a free 10-minute guided meditation, along with occasional reflections on the inward journey.',
    button: 'Send Me the Meditation',
    note: 'No spam. Unsubscribe anytime.',
    success: "Thank you. Your meditation is on its way. If you don't see it in a few minutes, check your Promotions or spam folder.",
    error: 'Something went wrong. Please try again, or email sachin@sachinbarot.com.',
  };

  // Adds the email to the Klaviyo list. Resolves only when Klaviyo accepts it.
  const subscribe = async ({ email, firstName, source, properties }) => {
    const profile = { email };
    if (firstName) profile.first_name = firstName;
    if (properties) profile.properties = properties;

    const res = await fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${KLAVIYO_COMPANY_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.api+json', revision: '2024-10-15' },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: source,
            profile: { data: { type: 'profile', attributes: profile } },
          },
          relationships: { list: { data: { type: 'list', id: KLAVIYO_LIST_ID } } },
        },
      }),
    });
    if (!res.ok) throw new Error(`Klaviyo ${res.status}`);
  };
  window.jithSubscribe = subscribe;

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
      <button type="submit" class="btn btn-primary">${COPY.button}</button>
    </form>
    <p class="signup-error" role="alert" hidden>${COPY.error}</p>
    <p class="signup-note">${COPY.note}</p>
    <p class="signup-success" role="status">${COPY.success}</p>
  `;

  // Only marks the visitor subscribed if Klaviyo accepted the email;
  // otherwise shows an error so no sign-up is silently lost.
  const wire = (card, source, onSuccess) => {
    const form = card.querySelector('.signup-form');
    const button = form.querySelector('button');
    const error = card.querySelector('.signup-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      button.disabled = true;
      error.hidden = true;
      try {
        await subscribe({ email: form.elements.email.value.trim(), source });
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
    wire(card, `Website: ${location.pathname} (${slot.dataset.signup})`);
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

  wire(overlay.querySelector('.signup-card'), `Website: ${location.pathname} (popup)`, () => setTimeout(hidePopup, 6000));

  setTimeout(() => overlay.classList.add('visible'), POPUP_DELAY_MS);
})();
