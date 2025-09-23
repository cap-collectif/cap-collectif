import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, BoxProps, CapUIFontSize, CapUIIcon, CapUIIconSize, Flex, Icon, useTheme } from '@cap-collectif/ui'
import { Menu, MenuItem } from '@szhsin/react-menu'
import { pxToRem } from '@shared/utils/pxToRem'
import { useNavBarContext, LinkProps } from './NavBar.context'
import { unescapeHTML } from './NavBar.utils'

const isCurrent = href => typeof window && (href === window?.location?.href || href === window?.location?.pathname)

export const NavBarMenu = React.forwardRef<
  HTMLElement,
  BoxProps & {
    links: readonly LinkProps[]
    title: string
    isExtended?: boolean
    isMobile?: boolean
    hoverColor: string
    hoverBg: string
  }
>(({ title, links, isExtended, color, hoverColor, bg, hoverBg, isMobile, ...rest }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const isCurrentLinkInMenu = links.some(({ href }) => isCurrent(href))

  const MenuButton = React.forwardRef<HTMLElement, { open: boolean; onClick?: () => void }>(
    ({ open, onClick }, ref) => (
      <Flex
        ref={ref}
        px={2}
        py={[5, 5, isExtended ? 4 : 5]}
        fontSize={CapUIFontSize.BodyLarge}
        as="button"
        color={color}
        fontWeight={isCurrentLinkInMenu ? 'semibold' : 'normal'}
        justifyContent={['space-between', '']}
        bg={open ? bg : ''}
        _hover={{ color: hoverColor, bg: String(bg) }}
        _focus={{ color, outline: 'none', boxShadow: `0px 0px 2px 2px ${String(bg)}` }}
        onClick={onClick}
        {...rest}
      >
        {title}
        <Icon name={open ? CapUIIcon.ArrowUpO : CapUIIcon.ArrowDownO} size={CapUIIconSize.Md} />
      </Flex>
    ),
  )

  const renderLinks = () =>
    links.map((link, idx) => {
      const { href, title } = link
      const isCurrentPage = isCurrent(href)
      return (
        <Box
          key={idx}
          as={isMobile ? 'a' : MenuItem}
          display="block"
          href={href}
          width={['100%', '100%', '320px']}
          bg={bg}
          color={color}
          fontWeight={isCurrentPage ? 'semibold' : 'normal'}
          borderRadius={[0, links.length > 6 && !isMobile ? 'normal' : 0]}
          _hover={{ color: href ? hoverColor : color, bg: hoverBg }}
          _focus={{ color: href ? hoverColor : color, bg: hoverBg, outline: 'none' }}
          px={[6, 2]}
          py={2}
          fontSize={CapUIFontSize.BodyLarge}
          lineHeight="base"
          className={isCurrentPage ? 'currentPage' : undefined}
        >
          {title}
        </Box>
      )
    })

  const megaMenuStyles =
    links.length > 6
      ? {
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          bg,
          _hover: { bg: hoverBg },
          width: '100vw',
          maxHeight: links.length > 10 ? `calc(23rem - (100vw - ${pxToRem(1133)})* 0.2)` : '15rem',
        }
      : { boxShadow: 'medium', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px', overflow: 'hidden' }

  if (!isMobile)
    return (
      <Box
        ref={ref}
        zIndex={50}
        sx={{
          ul: {
            // @ts-ignore
            listStyle: 'none',
            ...megaMenuStyles,
          },
        }}
      >
        <Menu
          menuButton={({ open }) => (
            <Flex
              px={2}
              py={[5, 5, isExtended ? 4 : 5]}
              fontSize={CapUIFontSize.BodyLarge}
              as="button"
              color={color}
              fontWeight={isCurrentLinkInMenu ? 'semibold' : 'normal'}
              bg={open ? bg : ''}
              _hover={{ color: hoverColor, bg: String(bg) }}
              _focus={{ color, outline: 'none', boxShadow: `0px 0px 2px 2px ${String(bg)}` }}
              aria-expanded={open}
              {...rest}
            >
              {title}
              <Icon name={open ? CapUIIcon.ArrowUpO : CapUIIcon.ArrowDownO} size={CapUIIconSize.Md} />
            </Flex>
          )}
        >
          {renderLinks()}
        </Menu>
      </Box>
    )
  return (
    <>
      <MenuButton open={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <Box display={isOpen ? 'block' : 'none'}>{renderLinks()}</Box>
    </>
  )
})

export const NavBarLink = React.forwardRef<
  HTMLElement,
  BoxProps & LinkProps & { isExtended?: boolean; hoverColor: string }
>(({ href, title, isExtended, color, hoverColor, bg, ...rest }, ref) => {
  const isCurrentPage = isCurrent(href)
  return (
    <Box
      ref={ref}
      as="a"
      className={`navLink${isCurrentPage ? ' currentPage' : ''}`}
      fontSize={CapUIFontSize.BodyLarge}
      href={href}
      px={2}
      py={[5, 5, isExtended ? 4 : 5]}
      color={color}
      fontWeight={isCurrentPage ? 'semibold' : 'normal'}
      _hover={{ color: hoverColor, bg: String(bg) }}
      _focus={{ color, outline: 'none', boxShadow: `0px 0px 2px 2px ${String(bg)}` }}
      {...rest}
    >
      {title}
    </Box>
  )
})
NavBarLink.displayName = 'NavBarLink'

const IS_BIG_LOGO_RATIO = 1.5

export const NavBarLogo: React.FC<{ logo?: { url: string; width: number; height: number } } & BoxProps> = ({
  logo,
  ...props
}) => {
  const intl = useIntl()
  const width = logo?.width > 180 ? 180 : logo?.width
  const {
    colors: { primary },
  } = useTheme()
  const focusColor = primary?.[700] || '#000'

  if (!logo) return null

  const isBigLogo = (logo.width || 0) / (logo.height || 1) <= IS_BIG_LOGO_RATIO

  return (
    <Box
      maxWidth={isBigLogo ? 'unset' : pxToRem(width)}
      height={isBigLogo ? pxToRem(88) : pxToRem(33)}
      my={isBigLogo ? 4 : 0}
      sx={{
        '>a:focus-visible': { boxShadow: 'none' },
        '>a:focus-visible > img': {
          boxShadow: `0 0 0 4px ${focusColor}`,
          outline: '2px #fff solid',
          outlineOffset: 0,
        },
      }}
      {...props}
    >
      <Box as="a" href="/">
        <Box
          as="img"
          sx={{ objectFit: 'contain' }}
          height="100%"
          loading="lazy"
          src={logo.url}
          alt={`${intl.formatMessage({ id: 'image.logo' })} - ${intl.formatMessage({
            id: 'back-to-homepage',
          })}`}
        />
      </Box>
    </Box>
  )
}

export const NavBarSkipLinks: React.FC = () => {
  const { skipLinks } = useNavBarContext()
  const { colors } = useTheme()
  if (!skipLinks?.length) return null

  return (
    <Flex
      as="ul"
      overflow="hidden"
      height={0}
      sx={{
        '&:focus-within': {
          height: 'unset',
          borderBottom: `1px solid ${colors['neutral-gray']['150']}`,
          overflow: 'visible',
        },
        listStyleType: 'none',
      }}
    >
      {skipLinks.map(({ href, title }, idx) => {
        return (
          <Box as="li" key={idx}>
            <Box as="a" display="block" href={href} px={[4]} py={2} color="neutral-gray.900">
              {title}
            </Box>
          </Box>
        )
      })}
    </Flex>
  )
}

export const NavBarBreadCrumb: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const intl = useIntl()
  const { colors } = useTheme()
  const { breadCrumbItems: items } = useNavBarContext()

  if (!items?.length) return null

  const mobileItem = items.find(i => i.showOnMobile) || items[items.length - 2]

  return (
    <Box
      as="nav"
      role="navigation"
      aria-label={intl.formatMessage({ id: 'navbar.breadcrumb' })}
      py={2}
      borderTop={`1px solid ${colors['neutral-gray']['150']}`}
      bg="white"
    >
      {isMobile ? (
        <Flex alignItems="center" mr={1} fontSize={CapUIFontSize.BodySmall} px={4}>
          <Icon name={CapUIIcon.ArrowLeftO} size={CapUIIconSize.Sm} mr={1} color="neutral-gray.700" />
          <Box as="a" href={mobileItem.href} color="neutral-gray.900" sx={{ textDecoration: 'underline' }}>
            {unescapeHTML(mobileItem.title)}
          </Box>
        </Flex>
      ) : (
        <Flex as="ol" maxWidth="91.43rem" width="100%" margin="auto" px={6}>
          {items.map(({ href, title }, index) => {
            const isCurrentPage = index === items.length - 1
            return (
              <Flex as="li" alignItems="center" mr={1} fontSize={CapUIFontSize.Caption} key={index}>
                <Box
                  as="a"
                  href={href}
                  fontWeight={isCurrentPage ? 'semibold' : 'normal'}
                  aria-current={isCurrentPage ? 'page' : undefined}
                  color="neutral-gray.900"
                  sx={{ textDecoration: isCurrentPage ? 'none' : 'underline' }}
                  _hover={{
                    textDecoration: isCurrentPage ? 'none' : 'underline',
                    color: 'primary.base',
                  }}
                >
                  {unescapeHTML(title)}
                </Box>
                {index === items.length - 1 ? null : (
                  <Icon name={CapUIIcon.ArrowRightO} size={CapUIIconSize.Sm} ml={1} color="neutral-gray.700" />
                )}
              </Flex>
            )
          })}
        </Flex>
      )}
    </Box>
  )
}
