// @flow
import React, { useState, useRef } from 'react';
import {
  FormattedDate,
  FormattedNumber,
  FormattedMessage,
  FormattedTime,
  type IntlShape,
  injectIntl,
} from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button, Col, Overlay } from 'react-bootstrap';
import { Field } from 'redux-form';
import moment from 'moment';
import toggle from '../../Form/Toggle';
import UnpublishedLabel from '../../Publishable/UnpublishedLabel';
import Popover from '../../Utils/Popover';
import type { ProposalUserVoteItem_vote } from '~relay/ProposalUserVoteItem_vote.graphql';
import type { ProposalUserVoteItem_step } from '~relay/ProposalUserVoteItem_step.graphql';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { ButtonDeleteVote, VoteItemContainer } from './ProposalsUserVotes.style';

type Props = {|
  vote: ProposalUserVoteItem_vote,
  step: ProposalUserVoteItem_step,
  isVoteVisibilityPublic: boolean,
  intl: IntlShape,
  onDelete: ?() => void,
  member: string,
|};

export const ProposalUserVoteItem = ({
  isVoteVisibilityPublic,
  onDelete,
  member,
  step,
  intl,
  vote,
}: Props) => {
  const { proposal } = vote;
  const target = useRef(null);
  const [show, setShow] = useState<boolean>(false);

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
            {!vote.published && (
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
      {onDelete && (
        <Col md={1} className="proposal-vote__delete-container">
          <ButtonDeleteVote
            ref={target}
            id={`${proposal.id}-proposal-vote__private-delete`}
            type="button"
            onClick={() => setShow(!show)}
            disabled={!step.open}
            className="proposal-vote__delete"
            aria-label={intl.formatMessage(
              isInterpellationContextFromStep(step)
                ? { id: 'aria.label.delete-support' }
                : { id: 'aria-label-delete-vote' },
            )}>
            <Icon name={ICON_NAME.trash} size={16} color={colors.dangerColor} />
          </ButtonDeleteVote>
          <Overlay
            trigger="click"
            onHide={() => setShow(false)}
            placement="bottom"
            target={target.current}
            rootClose
            show={show}>
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
                <Button bsStyle="default" onClick={() => setShow(false)} className="mr-10">
                  <FormattedMessage id="global.no" />
                </Button>
                {onDelete && (
                  <Button
                    bsStyle="danger"
                    onClick={() => {
                      onDelete();
                      setShow(false);
                    }}
                    className="proposal-vote__delete-confirm"
                    disabled={!step.open}>
                    <FormattedMessage id="btn-delete" />
                  </Button>
                )}
              </div>
            </Popover>
          </Overlay>
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
      published
      createdAt
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
