import { $Values } from 'utility-types'
import React from 'react'
import { connect } from 'react-redux'

import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import type { UserSearchDropdownChoice_user } from '~relay/UserSearchDropdownChoice_user.graphql'
import DropdownSelectChoice from '~ui/DropdownSelect/choice'
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { TYPE_ROLE } from '~/constants/AnalyseConstants'
import type { GlobalState } from '~/types'
import Tooltip from '~ds/Tooltip/Tooltip'
type Props = {
  readonly isIndeterminate?: boolean
  readonly user: UserSearchDropdownChoice_user
  readonly disabled?: boolean
  readonly type: $Values<typeof TYPE_ROLE>
  readonly emailNotification?: string
}
const UserSearchDropdownChoiceContainer = styled(DropdownSelectChoice)`
  & > span {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
  }

  img {
    margin-right: 8px;
    border-radius: 100%;
  }
`

const UserSearchDropdownChoice = ({
  user,
  isIndeterminate = false,
  disabled = false,
  type,
  emailNotification,
}: Props) => {
  const intl = useIntl()
  return (
    <UserSearchDropdownChoiceContainer isIndeterminate={isIndeterminate} value={user.id} disabled={disabled}>
      <div>
        {/** @ts-ignore */}
        <UserAvatarLegacy user={user} displayUrl={false} size={18} />
        <span>{user.username}</span>
      </div>

      {disabled && (
        <Tooltip
          key="explication"
          placement="top"
          label={intl.formatMessage(
            {
              id:
                type === TYPE_ROLE.SUPERVISOR
                  ? 'tooltip.help.text.unassign.supervisor'
                  : 'tooltip.help.text.unassign.analyst',
            },
            {
              email: emailNotification,
            },
          )}
          id="tooltip-description"
          className="text-left"
          style={{
            wordBreak: 'break-word',
          }}
        >
          <div>
            <Icon name={ICON_NAME.warning} size="15" />
          </div>
        </Tooltip>
      )}
    </UserSearchDropdownChoiceContainer>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  emailNotification: state.default.parameters['admin.mail.notifications.receive_address'],
})

// @ts-ignore
const container = connect(mapStateToProps)(UserSearchDropdownChoice)
export default createFragmentContainer(container, {
  user: graphql`
    fragment UserSearchDropdownChoice_user on User {
      id
      username
      ...UserAvatar_user
    }
  `,
})
