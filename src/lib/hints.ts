/**
 * One-time hints ("click the seal"). A hint is any element with data-hint="<key>".
 * It shows until the related interaction happens once, then never again (localStorage).
 */
const KEY = 'site:hints-used';

function used(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function applyHints(root: ParentNode = document) {
  const done = used();
  // Used hints keep their space (visibility, not display) so nothing shifts when they go.
  root.querySelectorAll<HTMLElement>('[data-hint]').forEach((el) => {
    el.classList.toggle('is-used', done.has(el.dataset.hint ?? ''));
  });
}

export function markHintUsed(key: string) {
  const done = used();
  if (!done.has(key)) {
    done.add(key);
    try {
      localStorage.setItem(KEY, JSON.stringify([...done]));
    } catch {
      /* storage disabled: hint simply hides for this page view */
    }
  }
  document.querySelectorAll<HTMLElement>(`[data-hint="${key}"]`).forEach((el) => el.classList.add('is-used'));
}
