import React, { PropTypes } from 'react';
import { VOTE_WIDGET_SIMPLE, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { deleteVoteVersion, deleteVoteOpinion, voteOpinion, voteVersion } from '../../../redux/modules/opinion';

export const OpinionVotesButton = React.createClass({
  propTypes: {
    style: PropTypes.object,
    opinion: PropTypes.object.isRequired,
    value: PropTypes.oneOf([-1, 0, 1]).isRequired,
    active: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
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
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  vote() {
    const { opinion, value, dispatch } = this.props;
    if (this.isVersion()) {
      voteVersion({ value }, opinion.id, opinion.parent.id, dispatch);
    } else {
      voteOpinion({ value }, opinion.id, dispatch);
    }
  },

  deleteVote() {
    const { opinion, dispatch } = this.props;
    if (this.isVersion()) {
      deleteVoteVersion(opinion.id, opinion.parent.id, dispatch);
    } else {
      deleteVoteOpinion(opinion.id, dispatch);
    }
  },

  voteAction() {
    const {
      disabled,
      user,
      active,
    } = this.props;
    if (!user || disabled) {
      return null;
    }
    return active ? this.deleteVote() : this.vote();
  },

  voteIsEnabled() {
    const {
      opinion,
      value,
    } = this.props;
    const voteType = this.isVersion() ? opinion.parent.type.voteWidgetType : opinion.type.voteWidgetType;
    if (voteType === VOTE_WIDGET_BOTH) {
      return true;
    }
    if (voteType === VOTE_WIDGET_SIMPLE) {
      return value === 1;
    }
    return false;
  },

  data: {
    '-1': {
      style: 'danger',
      str: 'nok',
      icon: 'cap cap-hand-unlike-2-1',
    },
    0: {
      style: 'warning',
      str: 'mitige',
      icon: 'cap cap-hand-like-2 icon-rotate',
    },
    1: {
      style: 'success',
      str: 'ok',
      icon: 'cap cap-hand-like-2-1',
    },
  },

  render() {
    if (!this.voteIsEnabled()) {
      return null;
    }
    const {
      user,
      features,
      disabled,
      style,
      value,
      active,
    } = this.props;
    const data = this.data[value];
    return (
      <LoginOverlay user={user} features={features}>
        <Button
          style={style}
          bsStyle={data.style}
          className="btn--outline"
          onClick={this.voteAction}
          active={active}
          aria-label={
            active
            ? this.getIntlMessage(`vote.aria_label_active.${data.str}`)
            : this.getIntlMessage(`vote.aria_label.${data.str}`)
          }
          disabled={disabled}
        >
          <i className={data.icon}></i>
          { ` ${this.getIntlMessage(`vote.${data.str}`)}` }
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state, props) => {
  const vote = props.opinion.parent
    ? state.opinion.versions[props.opinion.id].user_vote
    : state.opinion.opinions[props.opinion.id].user_vote;
  return {
    features: state.default.features,
    user: state.default.user,
    active: vote !== null && vote === props.value,
  };
};

export default connect(mapStateToProps)(OpinionVotesButton);
