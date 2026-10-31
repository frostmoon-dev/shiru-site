/**
 * Resolve once the intro (if any) is over and the browser is idle (or after `timeout` ms),
 * so heavy effects never compete with first paint or with the intro's timing.
 */
export function whenIdle(timeout = 2500): Promise<void> {
  return new Promise((resolve) => {
    // Safari has no requestIdleCallback.
    const ric = (window as { requestIdleCallback?: Window['requestIdleCallback'] }).requestIdleCallback;
    const idle = () => (ric ? ric(() => resolve(), { timeout }) : setTimeout(resolve, 800));
    const afterLoad = () => (document.readyState === 'complete' ? idle() : window.addEventListener('load', idle, { once: true }));
    if (document.documentElement.classList.contains('intro-pending')) {
      window.addEventListener('shiru:intro-done', afterLoad, { once: true });
    } else afterLoad();
  });
}
