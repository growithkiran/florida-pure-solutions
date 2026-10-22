const tablist = document.querySelector('.booking-tabs');
const tabs = [...tablist.querySelectorAll('[role="tab"]')];
const frames = [...document.querySelectorAll('#ghl-booking-slot iframe')];

function showTab(tab, focus = false) {
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
  }
  if (focus) tab.focus();
  const frame = document.getElementById(tab.getAttribute('aria-controls')).querySelector('iframe');
  // Ask the native helper to remeasure after revealing the preserved iframe.
  requestAnimationFrame(() => frame.iFrameResizer?.resize?.());
  window.ScrollTrigger?.refresh();
}

tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab)));
tablist.addEventListener('keydown', event => {
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  let next;
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tabs.length - 1;
  else return;
  event.preventDefault();
  showTab(tabs[next], true);
});

// The native helper may hide frames until it receives a size message. Keep
// real widgets visible with usable fallback heights; it still owns resizing.
for (const frame of frames) {
  frame.addEventListener('load', () => {
    frame.dataset.loaded = 'true';
    window.ScrollTrigger?.refresh();
  });
}
