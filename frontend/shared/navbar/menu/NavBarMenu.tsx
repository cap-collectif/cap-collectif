import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import useWindowWidth from '@shared/hooks/useWindowWidth'
import { Menu, MenuItem as ReactMenuItem } from '@szhsin/react-menu'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type { NavBarMenuQuery as NavBarMenuQueryType, NavBarMenuQuery$data } from '@relay/NavBarMenuQuery.graphql'
import { NavBarTheme, getTheme } from '../NavBar.utils'
import NewUserAvatar from '~/components/User/NewUserAvatar'

type Props = {
  currentLanguage: string
  newHeader?: boolean
}

const ActionItem = ({
  href,
  icon,
  children,
  as,
  onClick,
  avatar,
  target,
  rel,
  color,
}: {
  as: 'button' | 'a'
  children: React.ReactNode
  icon?: CapUIIcon
  avatar?: React.ReactNode
  href?: string
  onClick?: () => void
  target?: string
  rel?: string
  color: string
}) =>
  as === 'a' ? (
    <Flex as={as} href={href} alignItems="center" flexDirection="column" target={target} rel={rel}>
      {icon ? <Icon name={icon} size={CapUIIconSize.Md} color={color} /> : avatar}
      <Text as="span" color={color} fontSize={3}>
        {children}
      </Text>
    </Flex>
  ) : (
    <Flex as="button" onClick={onClick} alignItems="center" flexDirection="column">
      {icon ? <Icon name={icon} size={CapUIIconSize.Md} color={color} /> : avatar}
      <Text as="span" color={color} fontSize={3}>
        {children}
      </Text>
    </Flex>
  )

const MenuItem = ({
  theme,
  children,
  href,
  onClick,
  target,
  rel,
}: {
  theme: NavBarTheme
  children?: React.ReactNode
  href?: string
  onClick?: () => void
  target?: string
  rel?: string
}) => (
  <Flex
    as={ReactMenuItem}
    href={href}
    onClick={onClick}
    width="200px"
    target={target}
    rel={rel}
    bg={theme.subMenuBackground}
    color={theme.textColor}
    _hover={{
      color: theme.textHoverColor,
      bg: theme.menuActiveBackground,
      cursor: 'pointer',
      textDecoration: 'underline',
      svg: { color: theme.textHoverColor },
    }}
    _focus={{
      color: theme.textHoverColor,
      svg: { color: theme.textHoverColor },
      bg: theme.menuActiveBackground,
      outline: 'none',
    }}
    px={3}
    py={2}
    fontSize={3}
    lineHeight="base"
  >
    {children}
  </Flex>
)

export const NavBarMenuContent = ({
  user,
  loginWithOpenId,
  currentLanguage,
  theme,
}: Props & {
  theme: NavBarTheme
  user: NavBarMenuQuery$data['viewer']
  loginWithOpenId: boolean
}) => {
  const multilangue = useFeatureFlag('multilangue')
  const profiles = useFeatureFlag('profiles')
  const oauth2_switch_user = useFeatureFlag('oauth2_switch_user')
  const mediator = useFeatureFlag('mediator')

  const intl = useIntl()
  const prefix = multilangue ? `/${currentLanguage.split('-')[0]}` : ''
  const { width } = useWindowWidth()
  const isMobile = width < 1133

  const logout = () => {
    window.location.href = `${window.location.protocol}//${window.location.host}/logout`
  }

  const showAdminLink = user?.isAdmin || user?.isProjectAdmin || user?.isOrganizationMember
  const projectID = user?.projectsMediator?.edges?.[0]?.node?.id

  if (isMobile)
    return (
      <Flex alignItems="center" justifyContent="space-between" width="100%" px={6} py={4}>
        {profiles && !loginWithOpenId ? (
          /** @ts-ignore old and new relay types */
          <ActionItem
            as="a"
            href={`${prefix}/profile/${user.slug}`}
            avatar={<NewUserAvatar user={user} size="md" />}
            color={theme.textColor}
          >
            {intl.formatMessage({
              id: 'user.profile.title',
            })}
          </ActionItem>
        ) : null}
        {!profiles && loginWithOpenId && (
          <ActionItem
            as="a"
            href={`/sso/profile?referrer=${window.location.href}`}
            target="_blank"
            rel="noopener" /** @ts-ignore old and new relay types */
            avatar={<NewUserAvatar user={user} size="md" />}
            color={theme.textColor}
          >
            {intl.formatMessage({
              id: 'user.profile.title',
            })}
          </ActionItem>
        )}
        <ActionItem as="a" href={`${prefix}/profile/edit-profile`} icon={CapUIIcon.Profil} color={theme.textColor}>
          {intl.formatMessage({
            id: 'global.params',
          })}
        </ActionItem>
        <ActionItem as="button" onClick={logout} icon={CapUIIcon.Logout} color={theme.textColor}>
          {intl.formatMessage({
            id: 'global.logout',
          })}
        </ActionItem>
      </Flex>
    )

  return (
    <Box
      sx={{
        ul: {
          listStyle: 'none',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
          overflow: 'hidden',
        },
      }}
    >
      <Menu
        menuButton={({ open }) => (
          <Flex
            p={4}
            fontSize={3}
            as="button"
            color={theme.textColor}
            alignItems="center"
            bg={open ? theme.subMenuBackground : ''}
            _hover={{ color: theme.textHoverColor, bg: theme.subMenuBackground }}
            _focus={{
              color: theme.textColor,
              outline: 'none',
              boxShadow: `0px 0px 2px 2px ${theme.subMenuBackground}`,
            }}
          >
            <Flex
              alignItems="center"
              color="inherit"
              _hover={{ color: theme.textHoverColor, bg: theme.subMenuBackground }}
            >
              {/** @ts-ignore old and new relay types */}
              <NewUserAvatar user={user} size="md" mr={1} />
              {user.username}
            </Flex>
            <Icon name={open ? CapUIIcon.ArrowUpO : CapUIIcon.ArrowDownO} size={CapUIIconSize.Md} />
          </Flex>
        )}
        align="end"
      >
        {showAdminLink ? (
          <MenuItem theme={theme} href={user.isAdmin ? '/admin/' : '/admin-next/projects'}>
            <Icon name={CapUIIcon.Cog} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
            {intl.formatMessage({
              id: 'global.administration',
            })}
          </MenuItem>
        ) : null}
        {user.isEvaluerOnNewTool ? (
          <MenuItem theme={theme} href="/evaluations">
            <Icon name={CapUIIcon.Pencil} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
            {intl.formatMessage({
              id: 'evaluations.index.page_title',
            })}
          </MenuItem>
        ) : null}
        {user.roles?.includes('ROLE_MEDIATOR') && mediator && projectID ? (
          <MenuItem theme={theme} href={`/admin-next/project/${projectID}/mediator-view`}>
            <Icon name={CapUIIcon.Cog} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
            {intl.formatMessage({
              id: 'caption.manage.participants',
            })}
          </MenuItem>
        ) : null}
        {profiles && !loginWithOpenId && (
          <MenuItem theme={theme} href={`${prefix}/profile/${user.slug}`}>
            <Icon name={CapUIIcon.User} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
            {intl.formatMessage({
              id: 'user.profile.title',
            })}
          </MenuItem>
        )}
        {!profiles && loginWithOpenId && (
          <MenuItem theme={theme} href={`/sso/profile?referrer=${window.location.href}`} target="_blank" rel="noopener">
            <Icon name={CapUIIcon.User} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
            {intl.formatMessage({
              id: 'user.profile.title',
            })}
          </MenuItem>
        )}
        <MenuItem theme={theme} href={`${prefix}/profile/edit-profile`}>
          <Icon name={CapUIIcon.Profil} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
          {intl.formatMessage({
            id: 'global.params',
          })}
        </MenuItem>
        <MenuItem theme={theme} onClick={logout}>
          <Icon name={CapUIIcon.Logout} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
          {intl.formatMessage({
            id: 'global.logout',
          })}
        </MenuItem>
        {oauth2_switch_user && (
          <MenuItem theme={theme} href="/logout?ssoSwitchUser=true">
            <Icon name={CapUIIcon.User} size={CapUIIconSize.Md} color={theme.textColor} mr={1} />
            {intl.formatMessage({
              id: 'change-user',
            })}
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

export const QUERY = graphql`
  query NavBarMenuQuery {
    viewer {
      ...NewUserAvatar_user
      username
      slug
      isAdmin
      isEvaluerOnNewTool
      roles
      isProjectAdmin
      isOrganizationMember
      media {
        url
      }
      projectsMediator {
        edges {
          node {
            id
          }
        }
      }
    }
    siteColors {
      keyname
      value
    }
    ssoConfigurations(ssoType: OAUTH2) {
      edges {
        node {
          enabled
        }
      }
    }
  }
`

const NavBarMenu: React.FC<Props> = props => {
  const query = useLazyLoadQuery<NavBarMenuQueryType>(QUERY, {})

  if (!query) return null

  const { siteColors, viewer, ssoConfigurations } = query

  return (
    <NavBarMenuContent
      {...props}
      theme={getTheme(siteColors)}
      user={viewer}
      loginWithOpenId={ssoConfigurations.edges.some(({ node }) => node.enabled)}
    />
  )
}

export default NavBarMenu
