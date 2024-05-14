import { LinkProps } from './NavBar.context'

export type NavBarEvent = 'set-breadcrumb'

const onElementAvailable = (selector, callback) => {
  const observer = new MutationObserver(() => {
    if (document.querySelector(selector)) {
      observer.disconnect()
      callback()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

/**
 * Since our twig layout separates the header from the rest of the page, we
 * cannot use the setBreadCrumbItems from the NavBarContextProvider, hence
 * the event logic, waiting for the header to be fully loaded before firing
 */
export const dispatchNavBarEvent = (type: NavBarEvent, data: LinkProps[]) => {
  const event = new MessageEvent(type, {
    bubbles: true,
    data,
  })
  document.dispatchEvent(event)
  onElementAvailable('#main_navbar', () => {
    document.dispatchEvent(event)
  })
}

export type NavBarTheme = {
  textColor: string
  menuBackground: string
  subMenuBackground: string
  menuActiveBackground: string
  textActiveColor: string
  textHoverColor: string
}

export const getTheme = (
  siteColors: readonly {
    readonly keyname: string
    readonly value: string
  }[],
) => ({
  textColor: siteColors.find(c => c.keyname === 'color.main_menu.text')?.value || '#777',
  menuBackground: siteColors.find(c => c.keyname === 'color.main_menu.bg')?.value || '#ebebeb',
  subMenuBackground: siteColors.find(c => c.keyname === 'color.sub.menu.background')?.value || '#ebebeb',
  menuActiveBackground: siteColors.find(c => c.keyname === 'color.main_menu.bg_active')?.value || '#e7e7e7',
  textActiveColor: siteColors.find(c => c.keyname === 'color.main_menu.text_active')?.value || '#777',
  textHoverColor: siteColors.find(c => c.keyname === 'color.main_menu.text_hover')?.value || '#777',
})
