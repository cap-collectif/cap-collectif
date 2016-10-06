import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Col } from 'react-bootstrap';
import classNames from 'classnames';

import ProposalVotesHelper from '../../../services/ProposalVotesHelper';
import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import ProposalStatus from './ProposalStatus';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import { VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';

const ProposalPreview = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    showAllVotes: PropTypes.bool,
    showThemes: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      step: null,
      showAllVotes: false,
      showThemes: false,
    };
  },

  render() {
    const {
      proposal,
      step,
      showAllVotes,
      showThemes,
    } = this.props;
    const voteType = step ? step.voteType : 0;
    const classes = classNames({
      box: true,
      'bg-vip': proposal.author && proposal.author.vip,
    });

    return (
      <Col componentClass="li" xs={12} sm={6} md={4}>
        <div id={`proposal-${proposal.id}`} className="block block--bordered proposal__preview">
          <div className={classes}>
            <ProposalPreviewHeader proposal={proposal} />
            <ProposalPreviewBody
              proposal={proposal}
              showNullEstimation={voteType === VOTE_TYPE_BUDGET}
              showThemes={showThemes}
            />
            <div className="proposal__buttons text-center" >
              <div>
                <ProposalPreviewVote
                  {...this.props}
                  userHasVote={proposal.userHasVote}
                  onVoteChange={this.onVoteChange}
                />
              </div>
            </div>
            {
              step.voteThreshold > 0 &&
              <div style={{ marginTop: '20px' }}>
                <ProposalVoteThresholdProgressBar
                  proposal={proposal}
                  votesCount={proposal.votesCount}
                  voteThreshold={step.voteThreshold}
                  votesDelta={ProposalVotesHelper.getVotesDelta(proposal.userHasVote, proposal.userHasVote)}
                  stepId={step ? step.id : null}
                />
              </div>
            }
          </div>
          <ProposalStatus
            proposal={proposal}
            stepId={step ? step.id : null}
          />
          <ProposalPreviewFooter
            proposal={proposal}
            showVotes={(showAllVotes || voteType !== VOTE_TYPE_DISABLED) && step.voteThreshold === 0}
            votesDelta={ProposalVotesHelper.getVotesDelta(proposal.userHasVote, proposal.userHasVote)}
            stepId={step ? step.id : null}
          />
          <ProposalStatus
            proposal={proposal}
            stepId={step ? step.id : null}
          />
        </div>
      </Col>
    );
  },

});

export default ProposalPreview;
