import React from 'react';
import {IntlMixin} from 'react-intl';
import {Col} from 'react-bootstrap';
import classNames from 'classnames';

import ProposalVotesHelper from '../../../services/ProposalVotesHelper';
import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import {VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET} from '../../../constants/ProposalConstants';

const ProposalPreview = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
      creditsLeft: null,
    };
  },

  getInitialState() {
    return {
      userHasVote: this.props.proposal.userHasVote || false,
    };
  },

  onVoteChange(value) {
    this.setState({
      userHasVote: value,
    });
  },

  render() {
    const {proposal} = this.props;
    const classes = classNames({
      'box': true,
      'bg-vip': proposal.author && proposal.author.vip,
    });
    const {userHasVote} = this.state;

    return (
      <Col componentClass="li" xs={12} sm={6} md={4}>
        <div id={'proposal-' + proposal.id} className="block block--bordered proposal__preview">
          <div className={classes}>
            <ProposalPreviewHeader proposal={proposal} />
            <ProposalPreviewBody
              proposal={proposal}
              showNullEstimation={this.props.voteType === VOTE_TYPE_BUDGET}
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
          </div>
          <ProposalPreviewFooter
            proposal={proposal}
            showVote={this.props.voteType !== VOTE_TYPE_DISABLED}
            votesDelta={ProposalVotesHelper.getVotesDelta(proposal.userHasVote, userHasVote)}
            selectionStepId={this.props.selectionStepId}
          />
        </div>
      </Col>
    );
  },

});

export default ProposalPreview;
