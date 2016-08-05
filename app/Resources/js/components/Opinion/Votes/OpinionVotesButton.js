import React, { PropTypes } from 'react';
import { VOTE_WIDGET_SIMPLE, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';

import OpinionActions from '../../../actions/OpinionActions';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';

export const OpinionVotesButton = React.createClass({
  propTypes: {
    style: PropTypes.object,
    opinion: PropTypes.object.isRequired,
    value: PropTypes.oneOf([-1, 0, 1]).isRequired,
    disabled: PropTypes.bool,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
      disabled: false,
    };
  },

  isVersion() {
    return !!this.props.opinion.parent;
  },

  isCurrentVote() {
    return this.props.value === this.props.opinion.user_vote;
  },

  vote() {
    const { user, opinion, value } = this.props;
    if (this.isVersion()) {
      OpinionActions.vote({ value: value }, opinion.id, opinion.parent.id, user);
    } else {
      OpinionActions.vote({ value: value }, opinion.id, null, user);
    }
  },

  deleteVote() {
    const { user, opinion } = this.props;
    if (this.isVersion()) {
      OpinionActions.deleteVote(opinion.id, opinion.parent.id, user);
    } else {
      OpinionActions.deleteVote(opinion.id, null, user);
    }
  },

  voteAction() {
    if (!this.props.user || this.props.disabled) {
      return null;
    }
    return this.isCurrentVote() ? this.deleteVote() : this.vote();
  },

  voteIsEnabled() {
    const { opinion } = this.props;
    const voteType = this.isVersion() ? opinion.parent.type.voteWidgetType : opinion.type.voteWidgetType;
    if (voteType === VOTE_WIDGET_BOTH) {
      return true;
    }
    if (voteType === VOTE_WIDGET_SIMPLE) {
      return this.props.value === 1;
    }
    return false;
  },

  data: {
    '-1': {
      style: 'danger',
      str: 'nok',
      icon: 'cap cap-hand-unlike-2-1',
    },
    '0': {
      style: 'warning',
      str: 'mitige',
      icon: 'cap cap-hand-like-2 icon-rotate',
    },
    '1': {
      style: 'success',
      str: 'ok',
      icon: 'cap cap-hand-like-2-1',
    },
  },

  render() {
    if (!this.voteIsEnabled()) {
      return null;
    }
    const data = this.data[this.props.value];
    const { user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <Button
          style={this.props.style}
          bsStyle={data.style}
          className="btn--outline"
          onClick={this.voteAction}
          active={this.isCurrentVote()}
          aria-label={this.isCurrentVote() ? this.getIntlMessage(`vote.aria_label_active.${data.str}`) : this.getIntlMessage(`vote.aria_label.${data.str}`)}
          disabled={this.props.disabled}
        >
          <i className={data.icon}></i>
          { ` ${this.getIntlMessage(`vote.${data.str}`)}` }
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(OpinionVotesButton);
