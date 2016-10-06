import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

const ProposalVoteButton = React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
      onClick: null,
      onMouseOver: () => {},
      onMouseOut: () => {},
      onFocus: () => {},
      onBlur: () => {},
      style: {},
      className: '',
    };
  },

  render() {
    const { style, className, userHasVote, disabled, onMouseOver, onMouseOut, onFocus, onBlur, onClick } = this.props;
    const bsStyle = userHasVote ? 'danger' : 'success';
    let classes = classNames({
      'btn--outline': true,
      disabled,
    });
    classes += ` ${className}`;
    const onClickAction = disabled ? null : onClick;
    return (
      <Button
        bsStyle={bsStyle}
        className={classes}
        style={style}
        onClick={onClickAction}
        active={userHasVote}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {
          userHasVote
            ? this.getIntlMessage('proposal.vote.delete')
            : this.getIntlMessage('proposal.vote.add')
        }
      </Button>
    );
  },

});

export default ProposalVoteButton;
