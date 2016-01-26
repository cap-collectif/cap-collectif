import React from 'react';
import {IntlMixin} from 'react-intl';
import {Col} from 'react-bootstrap';
import classNames from 'classnames';

import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewButtons from './ProposalPreviewButtons';
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

  render() {
    const proposal = this.props.proposal;
    const classes = classNames({
      'box': true,
      'bg-vip': proposal.author && proposal.author.vip,
    });

    return (
      <Col componentClass="li" xs={12} sm={6} md={4}>
        <div id={'proposal-' + proposal.id} className="block block--bordered proposal__preview">
          <div className={classes}>
            <ProposalPreviewHeader proposal={proposal} />
            <ProposalPreviewBody
              proposal={proposal}
              showNullEstimation={this.props.voteType === VOTE_TYPE_BUDGET}
            />
            <ProposalPreviewButtons {...this.props} />
          </div>
          <ProposalPreviewFooter
            proposal={proposal}
            showVote={this.props.voteType !== VOTE_TYPE_DISABLED}
            selectionStepId={this.props.selectionStepId}
          />
        </div>
      </Col>
    );
  },

});

export default ProposalPreview;
