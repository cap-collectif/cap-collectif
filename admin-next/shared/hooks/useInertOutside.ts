import * as React from 'react'

/**
 * While `active`, makes everything outside the element inert (no keyboard focus, hidden from assistive technologies).
 * For dialogs that cover the screen but are rendered non-modal (CapUI renders its modals non-modal on mobile):
 * it gives them the keyboard and screen reader behaviour of a modal dialog (WCAG 2.4.3).
 * `element` can be any element inside the dialog: the dialog portal is the matching child of <body>.
 * Pass it from a callback ref stored in a state: a portal can mount after the dialog opens.
 */
const useInertOutside = (element: HTMLElement | null, active: boolean): void => {
  React.useEffect(() => {
    if (!active || !element) return

    let container: HTMLElement = element
    while (container.parentElement && container.parentElement !== document.body) container = container.parentElement
    if (container.parentElement !== document.body) return

    // Only restore the elements this hook made inert
    const madeInert = Array.from(document.body.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child !== container &&
        !child.hasAttribute('inert') &&
        child.tagName !== 'SCRIPT',
    )
    madeInert.forEach(child => child.setAttribute('inert', ''))

    return () => madeInert.forEach(child => child.removeAttribute('inert'))
  }, [element, active])
}

export default useInertOutside
