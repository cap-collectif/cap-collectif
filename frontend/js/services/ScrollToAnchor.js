// @flow
export const scrollToAnchor = (fallback?: string) => {
  const hash = typeof window === 'undefined' ? null : window.location.hash;
  if (hash) {
    const element = document.querySelector(hash)
      ? document.querySelector(hash)
      : fallback
      ? document.querySelector(fallback)
      : null;
    if (element) {
      element.scrollIntoView(false);
    }
  }
};

export default scrollToAnchor;
