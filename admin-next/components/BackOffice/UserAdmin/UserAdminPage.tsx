import { Button, CapUIIcon, CapUIIconSize, Flex, Icon, Link, TabBar, Text } from '@cap-collectif/ui'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import type { UserAdminPageQuery } from '@relay/UserAdminPageQuery.graphql'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import UserAdminAccount, { useUserAdminAccountForm } from './UserAdminAccount'
import UserAdminPassword, { useUserAdminPasswordForm } from './UserAdminPassword'
import UserAdminPersonalData, { useUserAdminPersonalDataForm } from './UserAdminPersonalData'
import UserAdminProfile, { useUserAdminProfileForm } from './UserAdminProfile'
import { getUserAdminUrl, SONATA_USER_LIST_URL } from './utils'

type Props = {
  userId: string
}

const QUERY = graphql`
  query UserAdminPageQuery($id: ID!) {
    user: node(id: $id) {
      __typename
      ... on User {
        id
        displayName
        url
        # Logs that an admin viewed this user, as the legacy page did
        isLogged(actionType: SHOW, description: "L'utilisateur :getUsername") {
          actionType
        }
        ...UserAdminAccount_user
        ...UserAdminProfile_user
        ...UserAdminPersonalData_user
        ...UserAdminPassword_user
      }
    }
    ...UserAdminProfile_query
  }
`

const TABS = ['account', 'profile', 'personal-data', 'password'] as const
type UserAdminTab = typeof TABS[number]

type UserData = Extract<NonNullable<UserAdminPageQuery['response']['user']>, { readonly __typename: 'User' }>
type UserAdminTabsProps = {
  user: UserData
  query: UserAdminPageQuery['response']
}

const UserAdminTabs: React.FC<UserAdminTabsProps> = ({ user, query }) => {
  const intl = useIntl()
  const { setBreadCrumbItems } = useNavBarContext()

  // The forms live here because the tab bar unmounts the inactive tabs
  const accountMethods = useUserAdminAccountForm(user)
  const profileMethods = useUserAdminProfileForm(user)
  const personalDataMethods = useUserAdminPersonalDataForm(user)
  const passwordMethods = useUserAdminPasswordForm()

  // The active tab is kept in the URL, so that a refresh stays on it
  const [activeTab, setActiveTab] = useQueryState('tab', parseAsStringLiteral(TABS).withDefault('account'))
  // TabBar never calls onChange: the clicked tab header is found from the DOM id it gets from its pane
  const syncActiveTab = (event: React.SyntheticEvent) => {
    const tab = (event.target as HTMLElement).closest('[id]')?.id
    if (TABS.includes(tab as UserAdminTab)) setActiveTab(tab as UserAdminTab)
  }

  const breadCrumbItems = React.useMemo(
    () => [
      { title: intl.formatMessage({ id: 'global.select_user.type' }), href: SONATA_USER_LIST_URL },
      { title: user.displayName, href: getUserAdminUrl(user.id) },
    ],
    [intl, user.displayName, user.id],
  )

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  return (
    <Flex direction="column" width="100%">
      <TabBar
        defaultTab={activeTab}
        onClickCapture={syncActiveTab}
        onKeyDownCapture={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') syncActiveTab(event)
        }}
        borderRadius="8px 8px 0 0"
        sideContent={
          <Flex color="blue.600" alignItems="center">
            <Icon name={CapUIIcon.Preview} size={CapUIIconSize.Sm} />
            <Link href={user.url} target="_blank" fontWeight={600}>
              {intl.formatMessage({ id: 'global.preview' })}
            </Link>
          </Flex>
        }
      >
        <TabBar.Pane id="account" title={intl.formatMessage({ id: 'user.profile.edit.account' })}>
          <UserAdminAccount user={user} methods={accountMethods} />
        </TabBar.Pane>
        <TabBar.Pane id="profile" title={intl.formatMessage({ id: 'user.profile.title' })}>
          <UserAdminProfile user={user} query={query} methods={profileMethods} />
        </TabBar.Pane>
        <TabBar.Pane id="personal-data" title={intl.formatMessage({ id: 'global.data' })}>
          <UserAdminPersonalData user={user} methods={personalDataMethods} />
        </TabBar.Pane>
        <TabBar.Pane id="password" title={intl.formatMessage({ id: 'global.password' })}>
          <UserAdminPassword user={user} methods={passwordMethods} />
        </TabBar.Pane>
      </TabBar>
    </Flex>
  )
}

export const UserAdminNotFound: React.FC = () => {
  const intl = useIntl()

  return (
    <Flex direction="column" alignItems="flex-start" spacing={4} bg="white" borderRadius="accordion" p={6}>
      <Text>{intl.formatMessage({ id: 'the-page-you-are-looking-for-cant-be-found' })}</Text>
      <Button variant="secondary" variantColor="primary" onClick={() => (window.location.href = SONATA_USER_LIST_URL)}>
        {intl.formatMessage({ id: 'global.back' })}
      </Button>
    </Flex>
  )
}

const UserAdminPage: React.FC<Props> = ({ userId }) => {
  const query = useLazyLoadQuery<UserAdminPageQuery>(QUERY, { id: userId })
  const { user } = query

  // An unknown id, or an id of another type, would otherwise open forms whose save always fails
  if (user?.__typename !== 'User') {
    return <UserAdminNotFound />
  }

  return <UserAdminTabs user={user} query={query} />
}

export default UserAdminPage
