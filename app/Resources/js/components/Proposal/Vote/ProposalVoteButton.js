import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { openVoteModal, deleteVote } from '../../../redux/modules/proposal';
import { connect } from 'react-redux';

const ProposalVoteButton = React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object,
    user: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
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
      step: null,
    };
  },

  render() {
    const {
      dispatch,
      style,
      step,
      user,
      className,
      proposal,
      disabled,
      onMouseOver,
      onMouseOut,
      onFocus,
      onBlur,
    } = this.props;
    const userHasVote = proposal.userHasVote;
    const bsStyle = user && userHasVote ? 'danger' : 'success';
    let classes = classNames({
      'btn--outline': true,
      disabled,
    });
    classes += ` ${className}`;
    const action = user && userHasVote
      ? () => { deleteVote(dispatch, step, proposal); }
      : () => { dispatch(openVoteModal(proposal.id)); };
    const onClick = disabled ? null : action;
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
          user && userHasVote
            ? this.getIntlMessage('proposal.vote.delete')
            : this.getIntlMessage('proposal.vote.add')
        }
      </Button>
    );
  },

});

export default connect()(ProposalVoteButton);
