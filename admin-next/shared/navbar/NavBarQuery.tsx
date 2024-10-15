import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type { NavBarQueryNewQuery as NavBarQueryType } from '@relay/NavBarQueryNewQuery.graphql'
import NavBar from './NavBar'
import { getTheme } from './NavBar.utils'

export const QUERY = graphql`
  query NavBarQueryNewQuery {
    menuItems {
      title
      href: link
      children {
        title
        href: link
      }
    }
    siteImage(keyname: "image.logo") {
      media {
        url
        width
        height
      }
    }
    siteColors {
      keyname
      value
    }
  }
`

const isBigLogoRatio = 1.5

const NavBarQuery: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const query = useLazyLoadQuery<NavBarQueryType>(QUERY, {})

  if (!query) return null

  const { menuItems, siteImage, siteColors } = query

  return (
    <NavBar
      links={menuItems}
      logoSrc={siteImage?.media?.url}
      theme={getTheme(siteColors)}
      isBigLogo={(siteImage?.media?.width || 0) / (siteImage?.media?.height || 1) <= isBigLogoRatio}
      logoWidth={siteImage?.media?.width}
    >
      {children}
    </NavBar>
  )
}

export default NavBarQuery
