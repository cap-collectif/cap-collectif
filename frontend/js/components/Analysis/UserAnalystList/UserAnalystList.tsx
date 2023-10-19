import * as React from 'react'
import { useIntl } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import UserAvatarList from '~ui/List/UserAvatarList'
import { AVATAR_SIZE } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole.style'
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy'
import type { UserAnalystList_proposal } from '~relay/UserAnalystList_proposal.graphql'
import UserAnalystListContainer, {
  SPACE_BETWEEN_AVATAR,
} from '~/components/Analysis/UserAnalystList/UserAnalystList.style'
import UserAnalystListHidden from '~/components/Analysis/UserAnalystListHidden/UserAnalystListHidden'
import { getStatus, getBadge, getHeadStatus } from './UserAnalyst.utils'
import Tooltip from '~ds/Tooltip/Tooltip'

export const MAX_AVATAR_DISPLAY = 3
type Props = {
  proposal: UserAnalystList_proposal
  dispatch: (arg0: any) => void
}

const UserAnalystList = ({ proposal, dispatch }: Props) => {
  const intl = useIntl()
  const { analysts, analyses, decision, assessment } = proposal
  const decisionState = getHeadStatus(decision, true)
  const assessmentState = getHeadStatus(assessment, false, decisionState)
  if (analysts && analysts.length === 0) return null
  const analystsDisplay = analysts ? Array.from(analysts).slice(0, MAX_AVATAR_DISPLAY) : []
  return (
    <UserAnalystListContainer>
      <UserAvatarList
        spaceBetweenAvatar={SPACE_BETWEEN_AVATAR}
        max={MAX_AVATAR_DISPLAY}
        avatarSize={AVATAR_SIZE}
        hasHiddenAvatarTooltip
      >
        {analystsDisplay.map(analyst => (
          <Tooltip
            key={`analyst-${analyst.id}`}
            placement="top"
            label={`${intl.formatMessage({
              id: 'global.assigned.to',
            })} ${analyst.username || ''}`}
            id={`avatar-analyst-${analyst.id}`}
            className="text-left"
            style={{
              wordBreak: 'break-word',
            }}
          >
            <div>
              <UserAvatarLegacy
                user={analyst}
                displayUrl={false}
                size={AVATAR_SIZE}
                badge={getBadge(getStatus(analyses, analyst.id, decisionState, assessmentState))}
                onClick={() =>
                  dispatch({
                    type: 'CHANGE_ANALYSTS_FILTER',
                    payload: [analyst.id],
                  })
                }
              />
            </div>
          </Tooltip>
        ))}
      </UserAvatarList>
      {analysts && analysts.length > MAX_AVATAR_DISPLAY && (
        <UserAnalystListHidden proposal={proposal} max={MAX_AVATAR_DISPLAY} />
      )}
    </UserAnalystListContainer>
  )
}

export default createFragmentContainer(UserAnalystList, {
  proposal: graphql`
    fragment UserAnalystList_proposal on Proposal {
      analyses {
        state
        analyst {
          id
        }
      }
      analysts {
        id
        username
        ...UserAvatar_user
      }
      decision {
        isApproved
        state
      }
      assessment {
        state
      }
      ...UserAnalystListHidden_proposal
    }
  `,
})
