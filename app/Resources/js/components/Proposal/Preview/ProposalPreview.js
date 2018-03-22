// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import ProposalStatus from './ProposalStatus';
import { VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import type { Proposal } from '../../../redux/modules/proposal';
import type { Uuid } from '../../../types';
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
          <ProposalPreviewBody
            proposal={proposal}
            showNullEstimation={voteType === VOTE_TYPE_BUDGET}
            step={step}
            showThemes={showThemes}
          />
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
