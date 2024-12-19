import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type { NavBarQueryNewQuery as NavBarQueryType } from '@relay/NavBarQueryNewQuery.graphql'
import NavBar from './NavBar'
import { getTheme } from './NavBar.utils'
import ChartModal, { ChartModalQuery } from '@shared/register/ChartModal'
import PrivacyModalQuery, { PrivacyModal } from '@shared/register/PrivacyModal'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'

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
    ...ChartModal_query
    ...PrivacyModal_query
  }
`

const isBigLogoRatio = 1.5

const NavBarQueryRender: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const query = useLazyLoadQuery<NavBarQueryType>(QUERY, {})

  if (!query) return null

  const { menuItems, siteImage, siteColors } = query

  return (
    <>
      <ChartModal query={query} />
      <PrivacyModal query={query} />
      <NavBar
        links={menuItems}
        logoSrc={siteImage?.media?.url}
        theme={getTheme(siteColors)}
        isBigLogo={(siteImage?.media?.width || 0) / (siteImage?.media?.height || 1) <= isBigLogoRatio}
        logoWidth={siteImage?.media?.width}
      >
        {children}
      </NavBar>
    </>
  )
}

const NavBarQuery: React.FC<{ children: React.ReactNode; SSRData?: layoutQuery$data }> = ({ children, SSRData }) => {
  if (!SSRData) return <NavBarQueryRender>{children}</NavBarQueryRender>

  const { menuItems, logo, siteColors } = SSRData

  return (
    <>
      <ChartModalQuery />
      <PrivacyModalQuery />
      <NavBar
        links={menuItems}
        logoSrc={logo?.media?.url}
        theme={getTheme(siteColors)}
        isBigLogo={(logo?.media?.width || 0) / (logo?.media?.height || 1) <= isBigLogoRatio}
        logoWidth={logo?.media?.width}
      >
        {children}
      </NavBar>
    </>
  )
}

export default NavBarQuery
