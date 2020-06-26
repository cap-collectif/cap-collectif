// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import UserAvatarList from '~ui/List/UserAvatarList';
import { AVATAR_SIZE } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole.style';
import UserAvatar from '~/components/User/UserAvatar';
import {
  getBadge,
  getStatus as getHeadStatus,
  type Status,
} from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import type { UserAnalystList_proposal } from '~relay/UserAnalystList_proposal.graphql';
import UserAnalystListContainer, {
  SPACE_BETWEEN_AVATAR,
} from '~/components/Analysis/UserAnalystList/UserAnalystList.style';
import UserAnalystListHidden from '~/components/Analysis/UserAnalystListHidden/UserAnalystListHidden';
import { PROPOSAL_STATUS } from '~/constants/AnalyseConstants';

export const MAX_AVATAR_DISPLAY = 3;

export const getStatus = (
  analyses: ?$ReadOnlyArray<Object>,
  idUser: string,
  decisionState: Status,
  assessmentState: Status,
): Status => {
  let status = PROPOSAL_STATUS.TODO;

  if (analyses && analyses?.length > 0) {
    analyses.forEach(analyse => {
      const isAnalyseMadeByUser = analyse.updatedBy.id === idUser;

      if (isAnalyseMadeByUser) {
        status = PROPOSAL_STATUS[analyse.state];
      }
    });
  }
  if (
    (decisionState.name === PROPOSAL_STATUS.DONE.name ||
      assessmentState.name === PROPOSAL_STATUS.FAVOURABLE.name ||
        assessmentState.name === PROPOSAL_STATUS.UNFAVOURABLE.name) &&
    (status.name === PROPOSAL_STATUS.TODO.name || status.name === PROPOSAL_STATUS.IN_PROGRESS.name)
  ) {
    return PROPOSAL_STATUS.TOO_LATE;
  }

  return status;
};

type Props = {
  proposal: UserAnalystList_proposal,
  dispatch: any => void,
};

const UserAnalystList = ({ proposal, dispatch }: Props) => {
  const intl = useIntl();
  const { analysts, analyses, decision, assessment } = proposal;
  const decisionState = getHeadStatus(decision, true);
  const assessmentState = getHeadStatus(assessment, false, decisionState);

  if (analysts && analysts.length === 0) return null;

  const analystsDisplay = analysts ? Array.from(analysts).slice(0, MAX_AVATAR_DISPLAY) : [];

  return (
    <UserAnalystListContainer>
      <UserAvatarList
        spaceBetweenAvatar={SPACE_BETWEEN_AVATAR}
        max={MAX_AVATAR_DISPLAY}
        avatarSize={AVATAR_SIZE}
        hasHiddenAvatarTooltip>
        {analystsDisplay.map(analyst => (
          <OverlayTrigger
            key={`analyst-${analyst.id}`}
            placement="top"
            overlay={
              <Tooltip id={`avatar-analyst-${analyst.id}`}>
                {intl.formatMessage({ id: 'global.assigned.to' })} {analyst.username}
              </Tooltip>
            }>
            <UserAvatar
              user={analyst}
              displayUrl={false}
              size={AVATAR_SIZE}
              badge={getBadge(getStatus(analyses, analyst.id, decisionState, assessmentState))}
              onClick={() => dispatch({ type: 'CHANGE_ANALYSTS_FILTER', payload: [analyst.id] })}
            />
          </OverlayTrigger>
        ))}
      </UserAvatarList>
      {analysts && analysts.length > MAX_AVATAR_DISPLAY && (
        <UserAnalystListHidden proposal={proposal} />
      )}
    </UserAnalystListContainer>
  );
};

export default createFragmentContainer(UserAnalystList, {
  proposal: graphql`
    fragment UserAnalystList_proposal on Proposal {
      analyses {
        state
        updatedBy {
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
});
