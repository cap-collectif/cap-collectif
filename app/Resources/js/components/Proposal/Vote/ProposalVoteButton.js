import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { openVoteModal } from '../../../redux/modules/proposal';
import { connect } from 'react-redux';

const ProposalVoteButton = React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    userHasVote: PropTypes.bool.isRequired,
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
      onMouseOver: () => {},
      onMouseOut: () => {},
      onFocus: () => {},
      onBlur: () => {},
      style: {},
      className: '',
    };
  },

  render() {
    const {
      dispatch,
      style, className, userHasVote, disabled, onMouseOver, onMouseOut, onFocus, onBlur } = this.props;
    const bsStyle = userHasVote ? 'danger' : 'success';
    let classes = classNames({
      'btn--outline': true,
      disabled,
    });
    classes += ` ${className}`;
    const onClick = disabled ? null : () => { dispatch(openVoteModal()); };
    console.log('onClick', onClick);
    return (
      <Button
        bsStyle={bsStyle}
        className={classes}
        style={style}
        onClick={onClick}
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

export default connect()(ProposalVoteButton);
