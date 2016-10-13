import React from 'react';
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
    proposal: React.PropTypes.object.isRequired,
    selectionStep: React.PropTypes.object,
    creditsLeft: React.PropTypes.number,
    showAllVotes: React.PropTypes.bool,
    showThemes: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStep: null,
      creditsLeft: null,
      showAllVotes: false,
      showThemes: false,
    };
  },

  getInitialState() {
    const { proposal } = this.props;
    return {
      userHasVote: proposal.userHasVote || false,
    };
  },

  onVoteChange() {
    this.setState({
      userHasVote: !this.state.userHasVote,
    });
  },

  render() {
    const {
      proposal,
      selectionStep,
      showAllVotes,
      showThemes,
    } = this.props;
    const voteType = selectionStep ? selectionStep.voteType : 0;
    const classes = classNames({
      box: true,
      'bg-vip': proposal.author && proposal.author.vip,
    });
    const { userHasVote } = this.state;

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
                  userHasVote={userHasVote}
                  onVoteChange={this.onVoteChange}
                />
              </div>
            </div>
            {
              selectionStep && selectionStep.voteThreshold > 0 &&
              <div style={{ marginTop: '20px' }}>
                <ProposalVoteThresholdProgressBar
                  proposal={proposal}
                  votesCount={proposal.votesCount}
                  voteThreshold={selectionStep.voteThreshold}
                  votesDelta={ProposalVotesHelper.getVotesDelta(proposal.userHasVote, userHasVote)}
                  selectionStepId={selectionStep ? selectionStep.id : null}
                />
              </div>
            }
          </div>
          <ProposalPreviewFooter
            proposal={proposal}
            showVotes={(showAllVotes || voteType !== VOTE_TYPE_DISABLED) && selectionStep.voteThreshold === 0}
            votesDelta={ProposalVotesHelper.getVotesDelta(proposal.userHasVote, userHasVote)}
            selectionStepId={selectionStep ? selectionStep.id : null}
          />
          <ProposalStatus
            proposal={proposal}
            selectionStepId={selectionStep ? selectionStep.id : null}
          />
        </div>
      </Col>
    );
  },

});

export default ProposalPreview;
