import React from 'react';
import { VOTE_WIDGET_SIMPLE, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import { IntlMixin } from 'react-intl';

import OpinionActions from '../../../actions/OpinionActions';
import LoginOverlay from '../../Utils/LoginOverlay';
import LoginStore from '../../../stores/LoginStore';
import { Button } from 'react-bootstrap';

const OpinionVotesButton = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
    opinion: React.PropTypes.object.isRequired,
    value: React.PropTypes.oneOf([-1, 0, 1]).isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
    };
  },

  isVersion() {
    return !!this.props.opinion.parent;
  },

  isCurrentVote() {
    return this.props.value === this.props.opinion.user_vote;
  },

  vote() {
    if (this.isVersion()) {
      OpinionActions.vote({ value: this.props.value }, this.props.opinion.id, this.props.opinion.parent.id);
    } else {
      OpinionActions.vote({ value: this.props.value }, this.props.opinion.id);
    }
  },

  deleteVote() {
    if (this.isVersion()) {
      OpinionActions.deleteVote(this.props.opinion.id, this.props.opinion.parent.id);
    } else {
      OpinionActions.deleteVote(this.props.opinion.id);
    }
  },

  voteAction() {
    if (!LoginStore.isLoggedIn()) {
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
    return (
      <LoginOverlay>
        <Button
          style={this.props.style}
          bsStyle={data.style}
          className="btn--outline"
          onClick={this.voteAction}
          active={this.isCurrentVote()}
          aria-label={this.isCurrentVote() ? this.getIntlMessage('vote.aria_label_active.' + data.str) : this.getIntlMessage('vote.aria_label.' + data.str)}
        >
          <i className={data.icon}></i>
          { ' ' + this.getIntlMessage('vote.' + data.str) }
        </Button>
      </LoginOverlay>
    );
  },

});

export default OpinionVotesButton;
