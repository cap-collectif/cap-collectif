import * as React from 'react'
import { Flex, Search } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { UserInviteAdminPageHeader_query$key } from '@relay/UserInviteAdminPageHeader_query.graphql'
import StatusTracker from '@components/BackOffice/StatusTracker/StatusTracker'
import UserInviteModalSteps from '@components/BackOffice/UserInvitation/send-invitations-modal/UserInviteModalSteps'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  readonly query: UserInviteAdminPageHeader_query$key
  readonly term: string
  readonly setTerm: (term: string) => void
  readonly values: { total: number; pending: number; accepted: number }
}
const FRAGMENT = graphql`
  fragment UserInviteAdminPageHeader_query on Query {
    ...UserInviteModalSteps_query
  }
`

const UserInviteAdminPageHeader = ({ query: queryFragment, term, setTerm, values }: Props): JSX.Element => {
  const intl = useIntl()
  const query = useFragment(FRAGMENT, queryFragment)

  return (
    <Flex spacing={6}>
      <UserInviteModalSteps query={query} />
      <Search
        width={pxToRem(270)}
        onChange={e => setTerm(e)}
        value={term}
        placeholder={intl.formatMessage({ id: 'search-invitation' })}
      />
      <StatusTracker values={values} />
    </Flex>
  )
}

export default UserInviteAdminPageHeader
