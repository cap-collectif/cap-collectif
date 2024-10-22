import * as React from 'react'
import { useIntl } from 'react-intl'

export type LinkProps = { readonly title: string; readonly href: string; readonly showOnMobile?: boolean }

export type NavBarContextProps = {
  breadCrumbItems?: LinkProps[]
  skipLinks?: LinkProps[]
}

type NavBarContextActionProps = {
  setBreadCrumbItems: (items: LinkProps[]) => void
  setSkipLinks: (items: LinkProps[]) => void
}

// @ts-ignore
export const NavBarContext = React.createContext<NavBarContextProps & NavBarContextActionProps>({})

export const useNavBarContext = (): NavBarContextProps & NavBarContextActionProps => {
  const context = React.useContext(NavBarContext)
  if (!context) {
    throw new Error(`You can't use the NavBarContext outside a NavBar component.`)
  }
  return context
}

export const NavBarContextProvider = ({ children, ...props }: React.PropsWithChildren<NavBarContextProps>) => {
  const intl = useIntl()
  const [breadCrumbItems, setBreadCrumbItems] = React.useState<LinkProps[]>(props.breadCrumbItems ?? [])
  const [skipLinks, setSkipLinks] = React.useState<LinkProps[]>(
    props.skipLinks ?? [
      { title: intl.formatMessage({ id: 'navbar.skip_links.menu' }), href: '#main_navbar' },
      { title: intl.formatMessage({ id: 'navbar.skip_links.content' }), href: '#main' },
    ],
  )

  const contextValue: NavBarContextProps & NavBarContextActionProps = {
    breadCrumbItems,
    setBreadCrumbItems,
    skipLinks,
    setSkipLinks,
  }

  return <NavBarContext.Provider value={contextValue}>{children}</NavBarContext.Provider>
}
