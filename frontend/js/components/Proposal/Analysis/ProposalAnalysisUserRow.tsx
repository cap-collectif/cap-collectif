import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'

import styled, { css } from 'styled-components'
import Label from '~/components/Ui/Labels/Label'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import type { ProposalAnalysisUserRow_user } from '~relay/ProposalAnalysisUserRow_user.graphql'
import UserAvatar from '~/components/User/UserAvatar'
import type {
  ProposalDecisionState,
  ProposalAssessmentState,
  ProposalAnalysisState,
} from '~relay/ProposalAnalysisPanel_proposal.graphql'

type Status = ProposalDecisionState | ProposalAssessmentState | ProposalAnalysisState
type Props = {
  user: ProposalAnalysisUserRow_user
  status: Status | null | undefined
  canEdit: boolean
  canConsult: boolean
  disabled?: boolean
  decidor?: boolean
  onClick?: (arg0: boolean | null | undefined) => void
}
const Decidor = styled.div`
  background: ${colors.yellow};
  width: 12px;
  height: 12px;
  border-radius: 10px;
  position: absolute;
  margin-left: 23px;
  color: ${colors.white};
  font-size: 8px;
  padding: 1px 2px;
  z-index: 1;
`
const Row = styled.div<{
  disabled: boolean
  decidor: boolean
}>`
  display: flex;
  align-items: center;

  button {
    background: none;
    border: none;
  }

  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
    width: 100%;

    div:nth-child(2) {
      font-size: 16px;
      color: ${colors.darkText};
      margin-right: 5px;
      font-weight: 600;
      max-width: calc(100% - s150px);
      word-break: break-all;
    }

    .label-container {
      display: flex;
      justify-content: space-around;
      align-content: center;
      align-items: center;
      gap: 5px;
    }

    img {
      width: 32px;
      height: 32px;
      border-radius: 20px;
      border: 1px solid;
    }
  }

  > svg {
    ${props => props.disabled && 'opacity: 0.2'};
  }

  > svg:hover {
    fill: ${props => !props.disabled && colors.lightBlue};
    cursor: ${props => !props.disabled && 'pointer'};
  }

  .user-avatar {
    ${({ decidor }) =>
      decidor &&
      css`
        border: 1px solid ${colors.white};
        box-shadow: 1px 1px ${colors.yellow}, -1px -1px ${colors.yellow}, -1px 1px ${colors.yellow},
          1px -1px ${colors.yellow};
      `}
  }
`

export const TODO_KEY = 'global.filter_to.do'
export const FAVOURABLE_KEY = 'global.favorable'
export const IN_PROGRESS_KEY = 'step.status.open'

export const getLabelData = (status: Status | null | undefined) => {
  switch (status) {
    case 'NONE':
      return {
        color: colors.duckBlue,
        icon: ICON_NAME.silent,
        text: 'global.filter_not-pronounced',
      }

    case 'IN_PROGRESS':
      return {
        color: colors.orange,
        icon: ICON_NAME.ongoing,
        text: IN_PROGRESS_KEY,
      }

    case 'FAVOURABLE':
      return {
        color: colors.lightGreen,
        icon: ICON_NAME.favorable,
        text: FAVOURABLE_KEY,
      }

    case 'UNFAVOURABLE':
      return {
        color: colors.dangerColor,
        icon: ICON_NAME.unfavorable,
        text: 'global.filter-unfavourable',
      }

    case 'TOO_LATE':
      return {
        color: colors.secondaryGray,
        icon: ICON_NAME.clock,
        text: 'global.filter_belated',
      }

    default:
      return {
        color: colors.lightBlue,
        icon: ICON_NAME.todo,
        text: TODO_KEY,
      }
  }
}
export const ProposalAnalysisUserRow = ({ user, status, canEdit, canConsult, disabled, decidor, onClick }: Props) => {
  if (!user) return null
  const labelData = getLabelData(status)
  return (
    <>
      {decidor && <Decidor>&#9733;</Decidor>}
      <Row disabled={canEdit && disabled} decidor={decidor || false}>
        <div>
          <UserAvatar size="md" user={user} />
          <div>{user.displayName}</div>
          <Label color={labelData.color} fontSize={8} className="label-container">
            <Icon name={labelData.icon} size={8} color={colors.white} />
            <FormattedMessage id={labelData.text} />
          </Label>
        </div>
        {canConsult && (
          <button
            type="button"
            className={canEdit ? 'edit-analysis-icon' : ''}
            onClick={() => {
              if (onClick && canEdit && !disabled) onClick(false)
              else if (onClick && canConsult) onClick(true)
            }}
          >
            <Icon name={canEdit ? ICON_NAME.pen : ICON_NAME.eye} size={16} color={colors.secondaryGray} />
          </button>
        )}
      </Row>
    </>
  )
}
export default createFragmentContainer(ProposalAnalysisUserRow, {
  user: graphql`
    fragment ProposalAnalysisUserRow_user on User {
      id
      displayName
      ...UserAvatar_user
    }
  `,
})
