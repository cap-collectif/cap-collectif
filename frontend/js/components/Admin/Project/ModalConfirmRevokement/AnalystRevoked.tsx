import React from 'react'

import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import UserAvatar from '~/components/User/UserAvatar'
import type { AnalystRevoked_analyst } from '~relay/AnalystRevoked_analyst.graphql'

type Props = {
  analyst: AnalystRevoked_analyst
}
const AnalystRevokedContainer = styled.li.attrs({
  className: 'analyst-revoked-container',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const AnalystRevoked = ({ analyst }: Props) => (
  <AnalystRevokedContainer>
    <UserAvatar user={analyst} size="md" displayUrl={false} />
    <span className="mr-10">{analyst.username}</span>
  </AnalystRevokedContainer>
)

export default createFragmentContainer(AnalystRevoked, {
  analyst: graphql`
    fragment AnalystRevoked_analyst on User @relay(mask: false) {
      id
      username
      ...UserAvatar_user
    }
  `,
})
