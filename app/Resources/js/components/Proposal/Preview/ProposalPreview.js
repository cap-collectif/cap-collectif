// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import ProposalStatus from './ProposalStatus';
import { CardContainer } from '../../Ui/Card/CardContainer';
import type { ProposalPreview_proposal } from './__generated__/ProposalPreview_proposal.graphql'
import type { ProposalPreview_step } from './__generated__/ProposalPreview_step.graphql'

type Props = {
  proposal: ProposalPreview_proposal,
  step: ProposalPreview_step,
};

export class ProposalPreview extends React.Component<Props> {

  render() {
    const { proposal, step } = this.props;

    return (
      <Col componentClass="li" xs={12} sm={6} md={4} lg={3}>
        <CardContainer
          id={`proposal-${proposal.id}`}
          className={
            proposal.author && proposal.author.vip ? 'bg-vip proposal-preview' : 'proposal-preview'
          }>
          <ProposalPreviewHeader proposal={proposal} />
          <ProposalPreviewBody
            proposal={proposal}
            step={step}
          />
          <ProposalPreviewFooter
            proposal={proposal}
            step={step}
          />
          <ProposalStatus proposal={proposal} stepId={step.id} />
        </CardContainer>
      </Col>
    );
  }
}

export default createFragmentContainer(
  ProposalPreview,
  {
    step: graphql`
      fragment ProposalPreview_step on Step {
        ... on CollectStep {
          voteType
        }
        ... on SelectionStep {
          voteType
        }
      }
    `,
    proposal: graphql`
      fragment ProposalPreview_proposal on Proposal {
        id
        author {
          vip
        }
        ...ProposalPreviewHeader_proposal
        ...ProposalPreviewFooter_proposal
        ...ProposalPreviewBody_proposal
      }
    `,
  }
);
