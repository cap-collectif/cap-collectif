// @flow
import React from 'react';
import {
  FormattedDate,
  FormattedNumber,
  FormattedMessage,
  FormattedTime,
  type IntlShape,
  injectIntl,
} from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Col } from 'react-bootstrap';
import { Field } from 'redux-form';
import moment from 'moment';
import { ButtonQuickAction, Popover, Button, CapUIIcon } from '@cap-collectif/ui';
import toggle from '../../Form/Toggle';
import UnpublishedLabel from '../../Publishable/UnpublishedLabel';
import type { ProposalUserVoteItem_vote } from '~relay/ProposalUserVoteItem_vote.graphql';
import type { ProposalUserVoteItem_step } from '~relay/ProposalUserVoteItem_step.graphql';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import { VoteItemContainer } from './ProposalsUserVotes.style';

type Props = {|
  vote: ProposalUserVoteItem_vote,
  step: ProposalUserVoteItem_step,
  isVoteVisibilityPublic: boolean,
  intl: IntlShape,
  onDelete: ?() => void,
  member: string,
  smsVoteEnabled: boolean,
  isAuthenticated: boolean,
|};

export const ProposalUserVoteItem = ({
  isVoteVisibilityPublic,
  onDelete,
  member,
  step,
  intl,
  vote,
  smsVoteEnabled,
  isAuthenticated,
}: Props) => {
  const { proposal } = vote;

  const colTitleWidth = () => {
    if (step.votesRanking === true && step.voteType === 'BUDGET') {
      return 6;
    }

    if (step.votesRanking === true) {
      return 8;
    }

    if (step.voteType === 'BUDGET') {
      return 7;
    }

    return 9;
  };

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

  const getToggleLabel = () => {
    if (isVoteVisibilityPublic) {
      return intl.formatMessage({ id: 'public' });
    }

    return intl.formatMessage({ id: 'global.anonymous' });
  };

  const showPrivateToggle = !(smsVoteEnabled && !isAuthenticated);

  return (
    <VoteItemContainer id={`vote-step${step.id}-proposal${proposal.id}`}>
      <Col md={colTitleWidth()} sm={12} xs={12}>
        <div>
          <div>
            <a href={proposal.url} className="proposals-user-votes__title">
              {getTitle(proposal.title)}
            </a>
            <br />
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
                    <FormattedTime value={moment(vote.createdAt)} hour="numeric" minute="numeric" />
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
            {!vote?.published && (
              <div>
                <UnpublishedLabel publishable={vote} />
              </div>
            )}
          </div>
        </div>
      </Col>
      {step.voteType === 'BUDGET' && (
        <Col md={2} sm={12} xs={12}>
          <div>
            <FormattedNumber
              minimumFractionDigits={0}
              value={proposal.estimation || 0}
              style="currency"
              currency="EUR"
            />
          </div>
        </Col>
      )}
      {showPrivateToggle && (
        <Col id={`${proposal.id}-proposal-vote__private`} md={onDelete ? 2 : 3} sm={12} xs={12}>
          <div>
            <div className="toggle-group">
              <Field
                labelSide="RIGHT"
                component={toggle}
                label={getToggleLabel()}
                roledescription={intl.formatMessage({ id: 'vote-toggle-aria-roledescription' })}
                name={`${member}.public`}
                normalize={val => !!val}
                id={`${proposal.id}-proposal-vote__private-toggle`}
              />
            </div>
          </div>
        </Col>
      )}
      {onDelete && (
        <Col md={1} className="proposal-vote__delete-container">
          <Popover
            style={{ outline: 'none' }}
            id="popover-positioned-right"
            placement="bottom"
            disclosure={
              <ButtonQuickAction
                variantColor="red"
                border="none"
                label={intl.formatMessage(
                  isInterpellationContextFromStep(step)
                    ? { id: 'aria.label.delete-support' }
                    : { id: 'aria-label-delete-vote' },
                )}
                icon={CapUIIcon.Trash}
                id={`${proposal.id}-proposal-vote__private-delete`}
                disabled={!step.open}
                className="proposal-vote__delete"
              />
            }>
            {({ closePopover }) => (
              <>
                <Popover.Body>
                  <i className="cap cap-attention icon--red" />
                  <FormattedMessage
                    id={
                      isInterpellationContextFromStep(step)
                        ? 'support.confirm.delete'
                        : 'are-you-sure-you-want-to-delete-this-vote'
                    }
                  />
                </Popover.Body>
                <Popover.Footer>
                  <Button
                    variant="primary"
                    variantColor="primary"
                    className="mr-10"
                    onClick={() => {
                      closePopover();
                    }}>
                    <FormattedMessage id="global.no" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="primary"
                      variantColor="danger"
                      onClick={() => {
                        onDelete();
                        closePopover();
                      }}
                      className="proposal-vote__delete-confirm"
                      disabled={!step.open}>
                      <FormattedMessage id="btn-delete" />
                    </Button>
                  )}
                </Popover.Footer>
              </>
            )}
          </Popover>
        </Col>
      )}
    </VoteItemContainer>
  );
};

const container = injectIntl(ProposalUserVoteItem);

export default createFragmentContainer(container, {
  vote: graphql`
    fragment ProposalUserVoteItem_vote on ProposalVote {
      ...UnpublishedLabel_publishable
      ... on ProposalUserVote {
        published
        createdAt
      }
      proposal {
        id
        title
        url
        estimation
      }
    }
  `,
  step: graphql`
    fragment ProposalUserVoteItem_step on ProposalStep {
      id
      open
      voteType
      votesRanking
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
