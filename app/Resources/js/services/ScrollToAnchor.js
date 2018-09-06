export const scrollToAnchor = (fallback: String) => {
  const hash = typeof window === 'undefined' ? null : window.location.hash;
  if (hash) {
    const element = document.querySelector(hash)
      ? document.querySelector(hash).scrollIntoView(false)
      : document.querySelector(fallback);
    if (typeof fallback !== 'undefined') {
      element.scrollIntoView(fallback);
    }
  }
};

export default scrollToAnchor;
