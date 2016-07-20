export const scrollToAnchor = () => {
  const hash = typeof window === 'undefined' ? null : window.location.hash;
  if (hash) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView(false);
    }
  }
};
