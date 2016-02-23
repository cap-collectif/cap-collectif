import React from 'react';
import { IntlMixin } from 'react-intl';
import { Col, Button } from 'react-bootstrap';
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

    const { proposal, votableStep } = this.props;
    const wrapperClassName = classNames({
      'sidebar-hideable': true,
      'sidebar-hidden-small': !this.props.expanded,
    });
    const steps = [this.props.votableStep];

    return (
      <Col xs={12} sm={3} className="sidebar" id="sidebar">
        <div className={wrapperClassName}>
          {
            steps.length > 1
            ? <StepsList
              steps={steps}
              votes={proposal.votesCountBySelectionSteps}
              style={{ borderBottom: '0' }}
            />
            : null
          }
          <ProposalVoteBox
            proposal={proposal}
            votableStep={votableStep}
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
