// Keep the separate GHL text widget mounted after its first reveal so a
// conversation survives a return to the hero. Never open it automatically.
const hero = document.querySelector('#home');
const header = document.querySelector('.header');
const dock = document.querySelector('#site-chat');
const mount = dock.querySelector('.site-chat-mount');
const status = dock.querySelector('.site-chat-status');
const message = status.querySelector('span');
const retry = status.querySelector('button');
const mobileBar = document.querySelector('.mobile-actions');
let started = false;
let ready = false;
let deadline;
let poll;
let heroObserver;

function checkReady() {
  const widget = mount.querySelector('chat-widget');
  if (!widget?.shadowRoot?.querySelector('button,[role="button"]')) return;
  // GHL renders in an open shadow root. Size only this text widget's native
  // panel; the independently mounted voice visualizer keeps its own styles.
  if (!widget.shadowRoot.querySelector('#fps-chat-sizing')) {
    const style = document.createElement('style');
    style.id = 'fps-chat-sizing';
    style.textContent = '.lc_text-widget{width:var(--fps-chat-panel-width,340px)!important}.lc_text-widget--box{width:100%!important;height:var(--fps-chat-panel-height,520px)!important;max-height:var(--fps-chat-panel-height,520px)!important}';
    widget.shadowRoot.append(style);
  }
  ready = true;
  clearTimeout(deadline);
  clearInterval(poll);
  status.hidden = true;
  dock.dataset.state = 'ready';
}

function unavailable() {
  if (ready) return;
  clearTimeout(deadline);
  clearInterval(poll);
  dock.dataset.state = 'error';
  message.textContent = 'Chat could not load.';
  retry.hidden = false;
}

function loadWidget() {
  started = true;
  ready = false;
  dock.dataset.state = 'loading';
  status.hidden = false;
  retry.hidden = true;
  message.textContent = 'Loading chat…';
  const script = document.createElement('script');
  script.src = 'https://widgets.leadconnectorhq.com/loader.js';
  script.dataset.resourcesUrl = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
  script.dataset.widgetId = '6ad98cb44e3a6a8f9550d6c3';
  script.async = true;
  script.addEventListener('error', unavailable, { once: true });
  mount.append(script);
  poll = setInterval(checkReady, 250);
  deadline = setTimeout(unavailable, 20000);
}

function updateVisibility() {
  const pastHero = hero.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom;
  // Returning to the hero restores focus before hiding an open native panel.
  if (!pastHero && dock.contains(document.activeElement)) {
    header.querySelector('.logo').focus({ preventScroll: true });
  }
  dock.hidden = !pastHero;
  dock.inert = !pastHero;
  if (pastHero && !started) loadWidget();
}

function observeLayout() {
  const headerHeight = Math.ceil(header.getBoundingClientRect().bottom);
  const barHeight = Math.ceil(mobileBar.getBoundingClientRect().height);
  const clearance = barHeight ? barHeight + 12 : 0;
  dock.style.setProperty('--chat-bottom-clearance', `${clearance}px`);
  dock.style.setProperty('--fps-chat-panel-width', `${Math.min(340, document.documentElement.clientWidth - 40)}px`);
  dock.style.setProperty('--fps-chat-panel-height', `${Math.max(160, Math.min(625, innerHeight - headerHeight - clearance - 102))}px`);
  heroObserver?.disconnect();
  heroObserver = new IntersectionObserver(updateVisibility, {
    rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0
  });
  heroObserver.observe(hero);
  updateVisibility();
}

retry.addEventListener('click', () => {
  mount.replaceChildren();
  loadWidget();
});
new ResizeObserver(observeLayout).observe(header);
new ResizeObserver(observeLayout).observe(mobileBar);
addEventListener('pageshow', updateVisibility);
addEventListener('resize', observeLayout);
observeLayout();
