// @flow
import * as React from 'react';
import { FormattedDate, FormattedMessage, FormattedTime } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Row, Col } from 'react-bootstrap';
import { Field } from 'redux-form';
import toggle from '../../Form/Toggle';
import ProposalDetailEstimation from '../../Proposal/Detail/ProposalDetailEstimation';
import type { ProposalUserVoteItem_vote } from './__generated__/ProposalUserVoteItem_vote.graphql';
import type { ProposalUserVoteItem_step } from './__generated__/ProposalUserVoteItem_step.graphql';

type Props = {
  vote: ProposalUserVoteItem_vote,
  step: ProposalUserVoteItem_step,
  ranking?: number,
  onDelete?: ?() => void,
  member: string,
};

export class ProposalUserVoteItem extends React.Component<Props> {
  render() {
    const { onDelete, member, step, vote, ranking } = this.props;
    const proposal = vote.proposal;

    // TODO use a value selector to update the label
    const isAnonymous = true;

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

    return (
      <Row
        className="proposals-user-votes__row d-flex flex-wrap"
        id={`vote-step${step.id}-proposal${proposal.id}`}>
        {ranking && (
          <Col md={1} xs={12} className="proposals-user-votes__col">
            <div className="proposals-user-votes__content justify-content-between">
              <i className="cap cap-android-menu excerpt" />
              <div className="d-flex">
                <span className="badge label-primary m-auto">{ranking + 1}</span>
              </div>
            </div>
          </Col>
        )}
        <Col className="proposals-user-votes__col" md={colTitleWidth()} xs={12}>
          <div className="proposals-user-votes__content">
            <div>
              <a href={proposal.show_url} className="proposals-user-votes__title">
                {proposal.title}
              </a>
              <br />
              {vote.createdAt ? (
                <FormattedMessage
                  id="voted-on-date-at-time"
                  values={{
                    date: (
                      <FormattedDate
                        value={vote.createdAt}
                        day="numeric"
                        month="long"
                        year="numeric"
                      />
                    ),
                    time: <FormattedTime value={vote.createdAt} hour="numeric" minute="numeric" />,
                  }}
                />
              ) : (
                <FormattedMessage id="notification-subject-new-vote" />
              )}
            </div>
          </div>
        </Col>
        <Col className="proposals-user-votes__col" md={2} xs={12}>
          <div className="proposals-user-votes__content justify-content-end">
            <div className="d-flex">
              <Field
                component={toggle}
                label={isAnonymous ? "public" : "admin.fields.idea_vote.private"}
                name={`${member}.anonymous`}
                normalize={val => !!val}
              />
            </div>
          </div>
        </Col>
        {step.voteType === 'BUDGET' && (
          <Col className="proposals-user-votes__col" md={2} xs={12}>
            <div className="proposals-user-votes__content justify-content-center">
              {/* $FlowFixMe */}
              <ProposalDetailEstimation proposal={proposal} showNullEstimation />
            </div>
          </Col>
        )}
        {onDelete && (
          <Col className="proposals-user-votes__col" md={1} xs={12}>
            <a
              onClick={() => {
                onDelete();
              }}
              className="proposal-vote__delete"
              disabled={!step.open}>
              <i className="cap cap-ios-close" />
            </a>
          </Col>
        )}
      </Row>
    );
  }
}

export default createFragmentContainer(ProposalUserVoteItem, {
  vote: graphql`
    fragment ProposalUserVoteItem_vote on ProposalVote {
      createdAt
      proposal {
        id
        title
        show_url
        ...ProposalDetailEstimation_proposal
      }
    }
  `,
  step: graphql`
    fragment ProposalUserVoteItem_step on ProposalStep {
      id
      open
      voteType
      votesRanking
    }
  `,
});
