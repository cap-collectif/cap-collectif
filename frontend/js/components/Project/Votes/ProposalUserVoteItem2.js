// @flow
import {
  FormattedDate,
  FormattedMessage,
  FormattedTime,
  injectIntl,
  type IntlShape,
} from 'react-intl';
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { Popover, Button, Col, OverlayTrigger } from 'react-bootstrap';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import Item from '~ui/DragnDrop/Item/Item';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import type { ProposalUserVoteItem2_vote } from '~relay/ProposalUserVoteItem2_vote.graphql';
import type { ProposalUserVoteItem2_step } from '~relay/ProposalUserVoteItem2_step.graphql';
import ProposalDetailEstimation from '~/components/Proposal/Detail/ProposalDetailEstimation';

type Props = {|
  index: number,
  vote: ProposalUserVoteItem2_vote,
  step: ProposalUserVoteItem2_step,
  ranking?: number,
  isVoteVisibilityPublic: boolean,
  intl: IntlShape,
  onDelete: ?() => void,
  showDraggableIcon: boolean,
|};

export const VoteItemContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .vote-title {
    color: ${colors.primaryColor};
    font-weight: 600;
  }
`;

export const ProposalUserVoteItem2 = ({
  index,
  onDelete,
  step,
  vote,
}: // intl,
// isVoteVisibilityPublic,
// ranking,
// showDraggableIcon = false
Props) => {
  const { proposal } = vote;
  const ref = React.useRef();

  const getTitle = title => {
    const windowWidth = window.innerWidth;

    let maxItemLength;

    if (windowWidth > 400) {
      maxItemLength = 85;
    } else {
      maxItemLength = 60;
    }

    return title.length > maxItemLength ? `${title.substring(0, maxItemLength)}...` : title;
  };

  const popoverConfirmDelete = (
    <Popover id="popover-positioned-right">
      <i className="cap cap-attention icon--red" />
      <FormattedMessage
        id={
          isInterpellationContextFromStep(step)
            ? 'support.confirm.delete'
            : 'are-you-sure-you-want-to-delete-this-vote'
        }
      />
      <div className="mt-10 d-flex justify-content-end">
        <Button
          bsStyle="default"
          onClick={() => {
            // TODO
            // ref?.current.popover.hide();
          }}
          className="mr-10">
          <FormattedMessage id="global.no" />
        </Button>
        {onDelete && (
          <Button
            bsStyle="danger"
            onClick={() => {
              onDelete();
              // TODO
              // ref?.current.popover.hide();
            }}
            className="proposal-vote__delete-confirm"
            disabled={!step.open}>
            <FormattedMessage id="btn-delete" />
          </Button>
        )}
      </div>
    </Popover>
  );

  return (
    <VoteItemContainer>
      <div className="item-line" key={`${proposal.title}-${index}`}>
        <div className="list-number">{index + 1}</div>
        <div className="item-content">
          <Item id="listFruits-0" position={1}>
            <div className="ml-10">
              <div className="flex-column">
                <a href={proposal.url} className="vote-title">
                  {' '}
                  {getTitle(proposal.title)}
                </a>
                {vote.createdAt ? (
                  <FormattedMessage
                    id={
                      isInterpellationContextFromStep(step)
                        ? 'supported.date-at-time'
                        : 'voted-on-date-at-time'
                    }
                    values={{
                      date: (
                        <FormattedDate
                          value={moment(vote.createdAt)}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      ),
                      time: (
                        <FormattedTime
                          value={moment(vote.createdAt)}
                          hour="numeric"
                          minute="numeric"
                        />
                      ),
                    }}
                  />
                ) : (
                  <FormattedMessage
                    id={
                      isInterpellationContextFromStep(step)
                        ? 'notification.subject.new-support'
                        : 'notification-subject-new-vote'
                    }
                  />
                )}
              </div>
            </div>
            <div>{vote.anonymous ? 'Anonymous' : 'Public'}</div>
            {step.voteType === 'BUDGET' && (
              <Col className="proposals-user-votes__col" md={2} sm={12} xs={12}>
                <div className="proposals-user-votes__content justify-content-center">
                  <ProposalDetailEstimation proposal={proposal} showNullEstimation />
                </div>
              </Col>
            )}

            {onDelete && (
              <Col className="proposals-user-votes__col proposal-vote-col__delete" md={1}>
                <OverlayTrigger
                  trigger="click"
                  placement="bottom"
                  overlay={popoverConfirmDelete}
                  ref={ref}>
                  <Icon name={ICON_NAME.trash} size={16} color={colors.dangerColor} />
                </OverlayTrigger>
              </Col>
            )}
          </Item>
        </div>
      </div>
    </VoteItemContainer>
  );
};

const container = injectIntl(ProposalUserVoteItem2);

export default createFragmentContainer(container, {
  vote: graphql`
    fragment ProposalUserVoteItem2_vote on ProposalVote {
      ...UnpublishedLabel_publishable
      published
      createdAt
      anonymous
      proposal {
        id
        title
        url
        ...ProposalDetailEstimation_proposal
      }
    }
  `,
  step: graphql`
    fragment ProposalUserVoteItem2_step on ProposalStep {
      id
      open
      voteType
      votesRanking
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
