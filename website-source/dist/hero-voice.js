const panel = document.querySelector('.hero-voice');
if (panel) {
  const mount = panel.querySelector('.hero-voice-mount');
  const status = panel.querySelector('.hero-voice-status');
  const message = status.querySelector('span');
  const retry = status.querySelector('button');
  let timer;
  let readinessPoll;
  let widgetObserver;
  let ready = false;
  const resize = new ResizeObserver(check);
  const children = new MutationObserver(check);
  children.observe(mount, { childList: true });
  resize.observe(mount);
  function check() {
    const widget = mount.querySelector('chat-widget');
    if (!widget || ready) return;
    if (widget.shadowRoot && !widgetObserver) {
      widgetObserver = new MutationObserver(check);
      widgetObserver.observe(widget.shadowRoot, { childList: true, subtree: true });
    }
    if (!widget.shadowRoot?.querySelector('button,[role="button"]') || widget.getBoundingClientRect().height < 40) return;
    ready = true;
    clearTimeout(timer);
    clearInterval(readinessPoll);
    panel.dataset.state = 'ready';
    status.hidden = true;
    resize.disconnect();
    children.disconnect();
    widgetObserver?.disconnect();
    window.ScrollTrigger?.refresh();
  }
  function unavailable() {
    if (ready) return;
    clearInterval(readinessPoll);
    panel.dataset.state = 'error';
    status.hidden = false;
    message.textContent = 'Voice assistant could not load. Please retry or call 1 877-295-7873.';
    retry.hidden = false;
  }
  function watch() {
    clearTimeout(timer);
    clearInterval(readinessPoll);
    mount.querySelector('script')?.addEventListener('error', unavailable, { once: true });
    // Native shadow content may mount without changing the reserved outer size.
    readinessPoll = setInterval(check, 250);
    timer = setTimeout(unavailable, 20000);
    check();
  }
  retry.addEventListener('click', () => {
    ready = false;
    widgetObserver?.disconnect();
    widgetObserver = undefined;
    mount.replaceChildren();
    panel.dataset.state = 'loading';
    message.textContent = 'Loading voice assistant…';
    retry.hidden = true;
    const script = document.createElement('script');
    script.src = 'https://widgets.leadconnectorhq.com/loader.js';
    script.dataset.resourcesUrl = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
    script.dataset.widgetId = '6ad97a25ae7fc72f342c6708';
    script.async = true;
    mount.append(script);
    watch();
  });
  watch();
}
