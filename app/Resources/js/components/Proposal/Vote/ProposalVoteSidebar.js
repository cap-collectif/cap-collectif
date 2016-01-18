import React from 'react';
import {IntlMixin} from 'react-intl';
import {Col, Button} from 'react-bootstrap';
import classNames from 'classnames';

import StepsList from '../../Steps/StepsList';
import ProposalVoteBox from './ProposalVoteBox';

const ProposalVoteSidebar = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    votableStep: React.PropTypes.object,
    userHasVote: React.PropTypes.bool,
    expanded: React.PropTypes.bool.isRequired,
    onToggleExpand: React.PropTypes.func.isRequired,
    creditsLeft: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      votableStep: null,
      userHasVote: false,
      creditsLeft: null,
    };
  },

  render() {
    if (!this.props.votableStep) {
      return null;
    }

    const proposal = this.props.proposal;
    const votableStepId = this.props.votableStep.id;
    const wrapperClassName = classNames({
      'sidebar-hideable': true,
      'sidebar-hidden-small': !this.props.expanded,
    });

    return (
      <Col xs={12} sm={3} className="sidebar" id="sidebar">
        <div className={wrapperClassName}>
          <StepsList
            steps={[this.props.votableStep]}
            votes={proposal.votesCountBySelectionSteps}
            style={{borderBottom: '0'}}
          />
          <ProposalVoteBox
            proposal={proposal}
            selectionStepId={votableStepId}
            className="block block--bordered box"
            formWrapperClassName="sidebar__form"
            userHasVote={this.props.userHasVote}
            creditsLeft={this.props.creditsLeft}
          />
        </div>
        <Button
          block
          className="sidebar-toggle sidebar-hideable sidebar-hidden-large btn--no-radius"
          bsStyle={this.props.userHasVote ? 'danger' : 'success'}
          bsSize="large"
          onClick={this.props.onToggleExpand}
        >
          {
            this.getIntlMessage(
              this.props.userHasVote
                ? 'proposal.vote.delete'
                : 'proposal.vote.add'
            )
          }
        </Button>
      </Col>
    );
  },

});

export default ProposalVoteSidebar;
