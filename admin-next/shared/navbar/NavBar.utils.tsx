import { LinkProps } from './NavBar.context'

export type NavBarEvent = 'set-breadcrumb'

export const onElementAvailable = (selector, callback) => {
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

export type GlobalTheme = NavBarTheme & {
  textHoverColor: string
  primaryColor: string
  primaryHoverColor: string
  primaryLabel: string
  pageTitleColor: string
  pageSubTitleColor: string
  pageBackgroundHeaderColor: string
  sectionBackground: string
  sectionTextColor: string
  bodyColor: string
  h1Color: string
  h2Color: string
  h3Color: string
  h4Color: string
  h5Color: string
  footerTitleColor: string
  footerTextColor: string
  footerBackgroundColor: string
  footerBottomBackgroundColor: string
  footerLinksColor: string
  linkColor: string
  linkHoverColor: string
}

export const getTheme = (
  siteColors: readonly {
    readonly keyname: string
    readonly value: string
  }[],
): GlobalTheme => {
  const bodyColor = siteColors.find(c => c.keyname === 'color.body.text')?.value || '#000'
  return {
    textColor: siteColors.find(c => c.keyname === 'color.main_menu.text')?.value || '#777777',
    menuBackground: siteColors.find(c => c.keyname === 'color.main_menu.bg')?.value || '#ebebeb',
    subMenuBackground: siteColors.find(c => c.keyname === 'color.sub.menu.background')?.value || '#ebebeb',
    menuActiveBackground: siteColors.find(c => c.keyname === 'color.main_menu.bg_active')?.value || '#e7e7e7',
    textActiveColor: siteColors.find(c => c.keyname === 'color.main_menu.text_active')?.value || '#777777',
    textHoverColor: siteColors.find(c => c.keyname === 'color.main_menu.text_hover')?.value || '#777777',
    primaryColor: siteColors.find(c => c.keyname === 'color.btn.primary.bg')?.value || '#777777',
    primaryHoverColor: siteColors.find(c => c.keyname === 'color.btn.ghost.hover')?.value || '#777777',
    primaryLabel: siteColors.find(c => c.keyname === 'color.btn.primary.text')?.value || '#777',
    pageTitleColor: siteColors.find(c => c.keyname === 'color.header.title')?.value || '#fff',
    pageSubTitleColor: siteColors.find(c => c.keyname === 'color.header.text')?.value || '#777777',
    pageBackgroundHeaderColor: siteColors.find(c => c.keyname === 'color.header.bg')?.value || '#777777',
    sectionBackground: siteColors.find(c => c.keyname === 'color.section.bg')?.value || '#777777',
    sectionTextColor: siteColors.find(c => c.keyname === 'color.body.text')?.value || '#000',
    bodyColor,
    h1Color: siteColors.find(c => c.keyname === 'color.h1')?.value || bodyColor,
    h2Color: siteColors.find(c => c.keyname === 'color.h2')?.value || bodyColor,
    h3Color: siteColors.find(c => c.keyname === 'color.h3')?.value || bodyColor,
    h4Color: siteColors.find(c => c.keyname === 'color.h4')?.value || bodyColor,
    h5Color: siteColors.find(c => c.keyname === 'color.h5')?.value || bodyColor,
    footerTitleColor: siteColors.find(c => c.keyname === 'color.footer.title')?.value || bodyColor,
    footerTextColor: siteColors.find(c => c.keyname === 'color.footer.text')?.value || bodyColor,
    footerBackgroundColor: siteColors.find(c => c.keyname === 'color.footer.bg')?.value || '#ebebeb',
    footerBottomBackgroundColor: siteColors.find(c => c.keyname === 'color.footer2.bg')?.value || '#ebebeb',
    footerLinksColor: siteColors.find(c => c.keyname === 'color.footer2.text')?.value || '#ebebeb',
    linkColor: siteColors.find(c => c.keyname === 'color.link.default')?.value || bodyColor,
    linkHoverColor: siteColors.find(c => c.keyname === 'color.link.hover')?.value || bodyColor,
  }
}

export const unescapeHTML = (str: string) =>
  str
    ?.replace(/&amp;/g, '&')
    ?.replace(/&lt;/g, '<')
    ?.replace(/&gt;/g, '>')
    ?.replace(/&quot;/g, '"')
    ?.replace(/&#039;/g, "'")
