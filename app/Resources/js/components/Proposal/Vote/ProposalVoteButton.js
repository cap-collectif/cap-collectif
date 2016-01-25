import React from 'react';
import {IntlMixin} from 'react-intl';
import {Button} from 'react-bootstrap';
import classNames from 'classnames';

const ProposalVoteButton = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
      selectionStepId: null,
      creditsLeft: null,
    };
  },

  userHasVote() {
    return this.props.proposal.userHasVote;
  },

  render() {
    const style = this.userHasVote() ? 'danger' : 'success';
    const classes = classNames({
      'proposal__preview__vote': true,
      'btn--outline': !this.userHasVote(),
      'disabled': this.props.disabled,
    });
    return (
      <Button
        bsStyle={style}
        className={classes}
        style={{width: '100%'}}
        onClick={this.props.onClick}
        active={this.userHasVote()}
      >
        {
          this.userHasVote()
            ? this.getIntlMessage('proposal.vote.delete')
            : this.getIntlMessage('proposal.vote.add')
        }
      </Button>
    );
  },

});

export default ProposalVoteButton;
