import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, BoxProps, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import { Menu, MenuItem } from '@szhsin/react-menu'

import { useNavBarContext, LinkProps } from './NavBar.context'

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

  const MenuButton = React.forwardRef<HTMLElement, { open: boolean; onClick?: () => void }>(
    ({ open, onClick }, ref) => (
      <Flex
        ref={ref}
        px={[4]}
        py={[5, 5, isExtended ? 4 : 5]}
        fontSize={3}
        as="button"
        color={color}
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
    links.map(link => (
      <Box
        as={isMobile ? 'a' : MenuItem}
        display="block"
        href={link.href}
        width={['100%', '100%', '320px']}
        bg={bg}
        color={color}
        _hover={{ color: link.href ? hoverColor : color, bg: hoverBg }}
        _focus={{ color: link.href ? hoverColor : color, bg: hoverBg, outline: 'none' }}
        px={[6, 3]}
        py={2}
        fontSize={3}
        lineHeight="base"
      >
        {link.title}
      </Box>
    ))

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
          maxHeight: '15rem',
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
              px={[4]}
              py={[5, 5, isExtended ? 4 : 5]}
              fontSize={3}
              as="button"
              color={color}
              bg={open ? bg : ''}
              _hover={{ color: hoverColor, bg: String(bg) }}
              _focus={{ color, outline: 'none', boxShadow: `0px 0px 2px 2px ${String(bg)}` }}
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
  return (
    <Box
      ref={ref}
      as="a"
      className="navLink"
      fontSize={3}
      href={href}
      px={4}
      py={[5, 5, isExtended ? 4 : 5]}
      color={color}
      _hover={{ color: hoverColor, bg: String(bg) }}
      _focus={{ color, outline: 'none', boxShadow: `0px 0px 2px 2px ${String(bg)}` }}
      {...rest}
    >
      {title}
    </Box>
  )
})

export const NavBarLogo: React.FC<{ src: string; isBigLogo?: boolean }> = ({ src, isBigLogo = false }) => {
  const intl = useIntl()

  return (
    <Flex width={isBigLogo ? 'unset' : '180px'} height={isBigLogo ? '88px' : '33px'} my={isBigLogo ? 4 : 0}>
      <Box as="a" href="/">
        <Box
          as="img"
          height="100%"
          loading="lazy"
          src={src}
          alt={`${intl.formatMessage({ id: 'image.logo' })} - ${intl.formatMessage({
            id: 'back-to-homepage',
          })}`}
        />
      </Box>
    </Flex>
  )
}

export const NavBarSkipLinks: React.FC = () => {
  const { skipLinks } = useNavBarContext()

  if (!skipLinks?.length) return null

  return (
    <Box as="ul" display="none" sx={{ '&:focus-within': { display: 'flex' } }}>
      {skipLinks.map(({ href, title }) => {
        return (
          <Box as="li">
            <Box as="a" href={href} px={[4]} py={2} color="neutral-gray.900">
              {title}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export const NavBarBreadCrumb: React.FC<{ borderColor: string; isMobile?: boolean }> = ({ borderColor, isMobile }) => {
  const intl = useIntl()
  const { breadCrumbItems: items } = useNavBarContext()

  if (!items?.length) return null

  return (
    <Box
      as="nav"
      aria-label={intl.formatMessage({ id: 'navbar.breadcrumb' })}
      py={2}
      px={[4, 6]}
      borderTop={`1px solid ${borderColor}`}
    >
      {isMobile ? (
        <Flex alignItems="center" mr={1} fontSize={1}>
          <Icon name={CapUIIcon.ArrowLeftO} size={CapUIIconSize.Sm} mr={1} color="neutral-gray.700" />
          <Box as="a" href={items[items.length - 2].href} color="neutral-gray.700" sx={{ textDecoration: 'underline' }}>
            {items[items.length - 2].title}
          </Box>
        </Flex>
      ) : (
        <Flex as="ol">
          {items.map(({ href, title }, index) => {
            const isCurrentPage = index === items.length - 1
            return (
              <Flex as="li" alignItems="center" mr={1} fontSize={1}>
                <Box
                  as="a"
                  href={href}
                  aria-current={isCurrentPage ? 'page' : undefined}
                  color={isCurrentPage ? 'neutral-gray.900' : 'neutral-gray.700'}
                  sx={{ textDecoration: isCurrentPage ? 'none' : 'underline' }}
                  _hover={{
                    textDecoration: isCurrentPage ? 'none' : 'underline',
                    color: isCurrentPage ? 'neutral-gray.900' : 'neutral-gray.700',
                  }}
                >
                  {title}
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
