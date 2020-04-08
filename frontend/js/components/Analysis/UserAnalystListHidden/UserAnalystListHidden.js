// @flow
import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Overlay, Tooltip } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import {
  MAX_AVATAR_DISPLAY,
  getStatus,
} from '~/components/Analysis/UserAnalystList/UserAnalystList';
import UserAvatar from '~/components/User/UserAvatar';
import { AVATAR_SIZE } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole.style';
import { getBadge } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import { AvatarHidden } from '~ui/List/UserAvatarList';
import type { UserAnalystListHidden_proposal } from '~relay/UserAnalystListHidden_proposal.graphql';
import UserAnalystListHiddenContainer, {
  TooltipAnalystListHiddenContainer,
  UserAvatarWrapper,
  UsernameWrapper,
} from './UserAnalystListHidden.style';

type Props = {
  proposal: UserAnalystListHidden_proposal,
};

const HIDDEN_AVATAR_SIZE = AVATAR_SIZE / 2;

const UserAnalystListHidden = ({ proposal }: Props) => {
  const [isTooltipRestAnalystsDisplay, setTooltipRestAnalystsDisplay] = useState<boolean>(false);
  const refTooltipRestAnalysts = useRef(null);
  const { analysts, analyses } = proposal;

  if (analysts && analysts.length === 0) return null;

  const restAnalysts = analysts
    ? Array.from(analysts).slice(MAX_AVATAR_DISPLAY, analysts.length)
    : [];
  const countRestAnalysts = restAnalysts?.length;

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
            <FormattedMessage tagName="span" id="global.assigned.to" /> &nbsp;
            {restAnalysts.map((analyst, index) => (
              <UserAvatarWrapper key={`analyst-${analyst.id}`}>
                <UserAvatar
                  user={analyst}
                  displayUrl={false}
                  size={HIDDEN_AVATAR_SIZE}
                  badge={getBadge(getStatus(analyses, analyst.id), true)}
                />
                <UsernameWrapper>{analyst.username}</UsernameWrapper>
                {countRestAnalysts !== index + 1 && (
                  <>
                    <span>,</span>{' '}
                  </>
                )}
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
        updatedBy {
          id
        }
      }
      analysts {
        id
        username
        ...UserAvatar_user
      }
    }
  `,
});
