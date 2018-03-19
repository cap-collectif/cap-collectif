// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import classNames from 'classnames';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import ProposalStatus from './ProposalStatus';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import { VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import type { Proposal } from '../../../redux/modules/proposal';
import ProposalFollowButton from '../Follow/ProposalFollowButton';
import type { Uuid } from '../../../types';
import Loader from '../../Utils/Loader';
import type ProposalPreviewFollowerButtonQueryResponse from '../Preview/__generated__/ProposalPreviewFollowerButtonQuery.graphql';
import { CardContainer } from '../../Ui/Card/CardContainer';

type Step = {
  id: Uuid,
  voteType: number,
  voteThreshold: number,
};

type Props = {
  proposal: Proposal,
  step: Step,
  showThemes: boolean,
  showComments: boolean,
};

export class ProposalPreview extends React.Component<Props> {
  static defaultProps = {
    showComments: false,
    showThemes: false,
  };
  render() {
    const { proposal, step, showThemes, showComments } = this.props;
    const voteType = step.voteType;

    return (
      <Col componentClass="li" xs={12} sm={6} md={4} lg={3}>
        <CardContainer
          id={`proposal-${proposal.id}`}
          className={
            proposal.author && proposal.author.vip ? 'bg-vip proposal-preview' : 'proposal-preview'
          }>
          <ProposalPreviewHeader proposal={proposal} />
            proposal={proposal}
          <ProposalPreviewBody
            showNullEstimation={voteType === VOTE_TYPE_BUDGET}
            step={step}
            showThemes={showThemes}
          />
            <div className="proposal__buttons text-center">
              {step.id === proposal.votableStepId && <ProposalPreviewVote proposal={proposal} />}
              <QueryRenderer
                environment={environment}
                query={graphql`
                  query ProposalPreviewFollowerButtonQuery($proposalId: ID!) {
                    proposal: node(id: $proposalId) {
                      ...ProposalFollowButton_proposal
                    }
                  }
                `}
                variables={{ proposalId: proposal.id }}
                render={({
                  error,
                  props,
                }: {
                  error: ?Error,
                  props?: ProposalPreviewFollowerButtonQueryResponse,
                }) => {
                  if (error) {
                    console.warn(error); // eslint-disable-line no-console
                    return graphqlError;
                  }
                  if (props) {
                    // eslint-disable-next-line react/prop-types
                    if (props.proposal) {
                      return (
                        <div>
                          <ProposalFollowButton proposal={props.proposal} />
                        </div>
                      );
                    }
                    return graphqlError;
                  }
                  return <Loader />;
                }}
              />
            </div>
            {step.voteThreshold > 0 && (
              <div style={{ marginTop: '20px' }}>
                <ProposalVoteThresholdProgressBar proposal={proposal} step={step} />
              </div>
            )}
          <ProposalPreviewFooter
            proposal={proposal}
            showVotes={voteType !== VOTE_TYPE_DISABLED}
            showComments={showComments}
            stepId={step.id}
          />
          <ProposalStatus proposal={proposal} stepId={step.id} />
        </CardContainer>
      </Col>
    );
  }
}

export default ProposalPreview;
