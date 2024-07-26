import * as React from 'react'
import { Box, Button, Flex } from '@cap-collectif/ui'
import { NavBarLink, NavBarMenu, NavBarSkipLinks, NavBarBreadCrumb, NavBarLogo } from './NavBar.components'
import { LinkProps } from './NavBar.context'
import useShowMore from '@shared/hooks/useShowMore'
import useWindowWidth from '@shared/hooks/useWindowWidth'

import { useIntl } from 'react-intl'
import { NavBarTheme } from './NavBar.utils'

type LinkOrMenu = LinkProps & { children?: readonly LinkProps[] }
const navBarZIndex = 1040

const NavBarContent = ({
  links,
  isExtended = false,
  theme,
  isMobile = false,
}: {
  links: readonly LinkOrMenu[]
  isExtended?: boolean
  theme: NavBarTheme
  isMobile?: boolean
}) => {
  const intl = useIntl()
  const [containerRef, seeMoreRef, handleItemWidth, overflowIndex, shouldDisplaySeeMore] = useShowMore(
    !isMobile,
    links.length,
  )

  const renderSeeMore = () => {
    const overflowedItems = links.filter((_, index) => index >= Number(overflowIndex))

    return (
      <NavBar.Menu
        ref={seeMoreRef}
        id="see-more"
        links={overflowedItems}
        title={intl.formatMessage({
          id: 'global.navbar.see_more',
        })}
        color={theme.textColor}
        bg={theme.subMenuBackground}
        hoverColor={theme.textHoverColor}
        hoverBg={theme.menuActiveBackground}
      />
    )
  }

  return (
    <Flex
      px={[0, 0, isExtended ? 2 : 8]}
      ref={containerRef}
      flex={1}
      flexWrap="wrap"
      width="100%"
      direction={['column', 'column', 'row']}
    >
      {links.map((link, index) => {
        const showBorder = isMobile && index < links.length - 1
        if (index >= Number(overflowIndex)) return null
        return link.children.length ? (
          <NavBar.Menu
            ref={handleItemWidth}
            links={link.children}
            title={link.title}
            color={theme.textColor}
            bg={theme.subMenuBackground}
            hoverBg={theme.menuActiveBackground}
            hoverColor={theme.textHoverColor}
            isMobile={isMobile}
            borderBottom={showBorder ? `1px solid ${theme.subMenuBackground}` : ''}
          />
        ) : (
          <NavBar.Link
            ref={handleItemWidth}
            title={link.title}
            href={link.href}
            color={theme.textColor}
            bg={theme.subMenuBackground}
            hoverColor={theme.textHoverColor}
            borderBottom={showBorder ? `1px solid ${theme.subMenuBackground}` : ''}
          />
        )
      })}
      {shouldDisplaySeeMore ? renderSeeMore() : null}
    </Flex>
  )
}

type NavBarProps = {
  children: React.ReactNode
  links: readonly LinkOrMenu[]
  logoSrc: string
  theme: NavBarTheme
  isBigLogo: boolean
}

const NavBarWeb = ({ children, links, theme, logoSrc, isBigLogo }: NavBarProps) => {
  const [isExtended] = React.useState(links.length > 6)

  return (
    <Flex justifyContent="center" bg={theme.menuBackground} width="100%">
      <Flex direction="column" bg={theme.menuBackground} overflow="visible" id="main_navbar" width="100%">
        <NavBar.SkipLinks />
        <Flex direction="column" zIndex={navBarZIndex} maxWidth="91.43rem" width="100%" margin="auto">
          <Flex px={6} justifyContent="space-between" alignItems="center" minHeight="4rem">
            <Flex alignItems="center">
              <NavBar.Logo src={logoSrc} isBigLogo={isBigLogo} />
              {isExtended ? null : <NavBar.Content links={links} isExtended={isExtended} theme={theme} />}
            </Flex>
            {children}
          </Flex>
          {isExtended ? <NavBar.Content links={links} isExtended={isExtended} theme={theme} /> : null}
        </Flex>
        <NavBar.BreadCrumb borderColor={theme.subMenuBackground} />
      </Flex>
    </Flex>
  )
}

const NavBarMobile = ({ children, links, theme, logoSrc }: NavBarProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const intl = useIntl()

  React.useEffect(() => {
    const body = document?.querySelector('body')
    if (!body) return
    body.style.overflow = isOpen ? 'hidden' : 'scroll'
  }, [isOpen])

  return (
    <Flex
      id="main_navbar"
      direction="column"
      bg={theme.menuBackground}
      overflow="visible"
      zIndex={navBarZIndex + (isOpen ? 50 : 0)}
      position={isOpen ? 'fixed' : 'relative'}
      width="100vw"
      top={isOpen ? '0' : ''}
      height={isOpen ? '100vw' : ''}
    >
      <Flex
        px={4}
        justifyContent="space-between"
        alignItems="center"
        minHeight="80px"
        borderBottom={isOpen ? `1px solid ${theme.subMenuBackground}` : ''}
      >
        <NavBar.Logo src={logoSrc} />
        <Button
          variant={isOpen ? 'tertiary' : 'primary'}
          px={4}
          py={3}
          variantColor="primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {intl.formatMessage({ id: isOpen ? 'global.close' : 'global.menu' })}
        </Button>
      </Flex>
      <NavBar.BreadCrumb borderColor={theme.subMenuBackground} isMobile />
      <Box
        bg={theme.menuBackground}
        position="fixed"
        width="100%"
        height="calc(100% - 160px)"
        display={isOpen ? 'block' : 'none'}
        overflow="scroll"
        top="80px" /** bigLogoTop */
        bottom="80px"
      >
        <NavBar.Content links={links} theme={theme} isMobile />
      </Box>
      <Box
        position="fixed"
        height="80px"
        borderTop={`1px solid ${theme.subMenuBackground}`}
        bottom={0}
        left={0}
        bg={theme.menuBackground}
        width="100vw"
        display={isOpen ? 'block' : 'none'}
      >
        {children}
      </Box>
    </Flex>
  )
}

const NavBar = (props: NavBarProps) => {
  const { width } = useWindowWidth()

  if (width < 1133) return <NavBarMobile {...props} />
  return <NavBarWeb {...props} />
}

NavBar.Link = NavBarLink
NavBar.Menu = NavBarMenu
NavBar.SkipLinks = NavBarSkipLinks
NavBar.BreadCrumb = NavBarBreadCrumb
NavBar.Logo = NavBarLogo
NavBar.Content = NavBarContent

export default NavBar
