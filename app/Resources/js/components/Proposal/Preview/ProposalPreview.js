import React, { PropTypes } from 'react';
import { Col } from 'react-bootstrap';
import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import ProposalStatus from './ProposalStatus';
import { VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { CardContainer } from '../../Ui/Card/CardContainer';

const ProposalPreview = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    showThemes: PropTypes.bool,
    showComments: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      showThemes: false,
      showComments: false,
    };
  },

  render() {
    const { proposal, step, showThemes, showComments } = this.props;
    const voteType = step.voteType;

    return (
      <Col componentClass="li" xs={12} sm={6} md={4} lg={3}>
        <CardContainer
          id={`proposal-${proposal.id}`}
          className={proposal.author && proposal.author.vip ? 'bg-vip ' : null}>
          <ProposalPreviewHeader proposal={proposal} />
          <ProposalPreviewBody
            proposal={proposal}
            showNullEstimation={voteType === VOTE_TYPE_BUDGET}
            showThemes={showThemes}
            step={step}
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
  },
});

export default ProposalPreview;
