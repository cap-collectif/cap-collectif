import { $Values } from 'utility-types'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy'
import { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import type { AnalysisProposalListRole_proposal } from '~relay/AnalysisProposalListRole_proposal.graphql'
import AnalysisProposalListRoleContainer, {
  AVATAR_SIZE,
  RoleWrapper,
} from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole.style'
import UserAnalystList from '~/components/Analysis/UserAnalystList/UserAnalystList'
import { getBadge, getHeadStatus } from '~/components/Analysis/UserAnalystList/UserAnalyst.utils'
import Tooltip from '~ds/Tooltip/Tooltip'

export type Status = {
  name: string
  icon: $Values<typeof ICON_NAME>
  label: string
  color: string
}
type Props = {
  proposal: AnalysisProposalListRole_proposal
  dispatch: (arg0: any) => void
}

const AnalysisProposalListRole = ({ proposal, dispatch }: Props) => {
  const { assessment, decision, supervisor, decisionMaker } = proposal
  const decisionStatus = getHeadStatus(decision, true)
  const assessmentStatus = getHeadStatus(assessment, false, decisionStatus)
  const intl = useIntl()
  return (
    <AnalysisProposalListRoleContainer>
      <RoleWrapper className="role-analysts">
        <UserAnalystList proposal={proposal} dispatch={dispatch} />
      </RoleWrapper>

      <RoleWrapper className="role-supervisor">
        {supervisor && (
          <Tooltip
            placement="top"
            label={`${intl.formatMessage({
              id: 'global.assigned.to',
            })} ${supervisor.username || ''}`}
            id="avatar-supervisor"
            className="text-left"
            style={{
              wordBreak: 'break-word',
            }}
          >
            <div>
              <UserAvatarLegacy
                user={supervisor}
                displayUrl={false}
                size={AVATAR_SIZE}
                badge={getBadge(assessmentStatus)}
                onClick={() =>
                  dispatch({
                    type: 'CHANGE_SUPERVISOR_FILTER',
                    payload: supervisor.id,
                  })
                }
              />
            </div>
          </Tooltip>
        )}
      </RoleWrapper>

      <RoleWrapper>
        {decisionMaker && (
          <Tooltip
            placement="top"
            label={`${intl.formatMessage({
              id: 'global.assigned.to',
            })} ${decisionMaker.username || ''}`}
            id="avatar-decisionMaker"
            className="text-left"
            style={{
              wordBreak: 'break-word',
            }}
          >
            <div>
              <UserAvatarLegacy
                user={decisionMaker}
                displayUrl={false}
                size={AVATAR_SIZE}
                badge={getBadge(decisionStatus)}
                onClick={() =>
                  dispatch({
                    type: 'CHANGE_DECISION_MAKER_FILTER',
                    payload: decisionMaker.id,
                  })
                }
              />
            </div>
          </Tooltip>
        )}
      </RoleWrapper>
    </AnalysisProposalListRoleContainer>
  )
}

export default createFragmentContainer(AnalysisProposalListRole, {
  proposal: graphql`
    fragment AnalysisProposalListRole_proposal on Proposal {
      ...UserAnalystList_proposal
      assessment {
        state
        supervisor {
          id
        }
      }
      decision {
        state
        isApproved
        decisionMaker {
          id
        }
      }
      supervisor {
        id
        username
        ...UserAvatar_user
      }
      decisionMaker {
        id
        username
        ...UserAvatar_user
      }
    }
  `,
})
