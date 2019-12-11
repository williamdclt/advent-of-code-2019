export function hackyAwait(fn: (...any: []) => Promise<unknown>) {
  let done = false;
  fn().then(() => {
    done = true;
  });

  function wait() {
    if (!done) setTimeout(wait, 1000);
  }
  wait();
}
