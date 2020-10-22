// @flow
import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Overlay, Tooltip } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import {
  MAX_AVATAR_DISPLAY,
  getStatus as getStatusAnalyst,
} from '~/components/Analysis/UserAnalystList/UserAnalystList';
import UserAvatar from '~/components/User/UserAvatar';
import { AVATAR_SIZE } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole.style';
import {
  getBadge,
  getStatus,
} from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import { AvatarHidden } from '~ui/List/UserAvatarList';
import type { UserAnalystListHidden_proposal } from '~relay/UserAnalystListHidden_proposal.graphql';
import UserAnalystListHiddenContainer, {
  TooltipAnalystListHiddenContainer,
  UserAvatarWrapper,
  UsernameWrapper,
} from './UserAnalystListHidden.style';

const HIDDEN_AVATAR_SIZE = 15;

type Props = {
  proposal: UserAnalystListHidden_proposal,
};

const UserAnalystListHidden = ({ proposal }: Props) => {
  const [isTooltipRestAnalystsDisplay, setTooltipRestAnalystsDisplay] = useState<boolean>(false);
  const refTooltipRestAnalysts = useRef(null);
  const { analysts, analyses, decision, assessment } = proposal;
  const decisionState = getStatus(decision, true);
  const assessmentState = getStatus(assessment, false, decisionState);

  if (analysts && analysts.length === 0) return null;

  const restAnalysts = analysts
    ? Array.from(analysts).slice(MAX_AVATAR_DISPLAY, analysts.length)
    : [];

  return (
    <UserAnalystListHiddenContainer>
      <AvatarHidden
        max={0}
        avatarSize={AVATAR_SIZE}
        totalAvatar={restAnalysts.length}
        onMouseOver={() => setTooltipRestAnalystsDisplay(true)}
        onFocus={() => setTooltipRestAnalystsDisplay(true)}
        onMouseOut={() => setTooltipRestAnalystsDisplay(false)}
        onBlur={() => setTooltipRestAnalystsDisplay(false)}
        reference={refTooltipRestAnalysts}
      />
      <Overlay
        show={isTooltipRestAnalystsDisplay}
        target={refTooltipRestAnalysts.current}
        placement="top">
        <Tooltip id="tooltip-analysts-hidden" className="tooltip-analysts-hidden">
          <TooltipAnalystListHiddenContainer>
            <div>
              <FormattedMessage tagName="span" id="global.assigned.to" />
              <span>:</span>
            </div>

            {restAnalysts.map(analyst => (
              <UserAvatarWrapper key={`analyst-${analyst.id}`}>
                <UserAvatar
                  user={analyst}
                  displayUrl={false}
                  size={HIDDEN_AVATAR_SIZE}
                  badge={getBadge(
                    getStatusAnalyst(analyses, analyst.id, decisionState, assessmentState),
                    true,
                  )}
                />
                <UsernameWrapper>{analyst.username}</UsernameWrapper>
              </UserAvatarWrapper>
            ))}
          </TooltipAnalystListHiddenContainer>
        </Tooltip>
      </Overlay>
    </UserAnalystListHiddenContainer>
  );
};

export default createFragmentContainer(UserAnalystListHidden, {
  proposal: graphql`
    fragment UserAnalystListHidden_proposal on Proposal {
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
    }
  `,
});
