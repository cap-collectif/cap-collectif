import React from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

const ProposalVoteButton = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool.isRequired,
    userHasVote: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
    onMouseOver: React.PropTypes.func,
    onMouseOut: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
      onMouseOver: () => {},
      onMouseOut: () => {},
      onFocus: () => {},
      onBlur: () => {},
    };
  },

  render() {
    const style = this.props.userHasVote ? 'danger' : 'success';
    const classes = classNames({
      'proposal__preview__vote': true,
      'btn--outline': !this.props.userHasVote,
      'disabled': this.props.disabled,
    });
    const onClick = this.props.disabled ? null : this.props.onClick;
    return (
      <Button
        bsStyle={style}
        className={classes}
        style={{ width: '100%' }}
        onClick={onClick}
        active={this.props.userHasVote}
        onMouseOver={this.props.onMouseOver}
        onMouseOut={this.props.onMouseOut}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
      >
        {
          this.props.userHasVote
            ? this.getIntlMessage('proposal.vote.delete')
            : this.getIntlMessage('proposal.vote.add')
        }
      </Button>
    );
  },

});

export default ProposalVoteButton;
