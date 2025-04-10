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
        theme={getTheme(siteColors)}
        logo={siteImage?.media}
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
        theme={getTheme(siteColors)}
        logo={logo?.media}
      >
        {children}
      </NavBar>
    </>
  )
}

export default NavBarQuery
