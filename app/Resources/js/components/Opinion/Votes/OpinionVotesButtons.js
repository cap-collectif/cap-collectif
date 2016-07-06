import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionVotesButton from './OpinionVotesButton';
import { ButtonToolbar } from 'react-bootstrap';
import { connect } from 'react-redux';

const OpinionVotesButtons = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.opinion.author.uniqueId;
  },

  render() {
    if (!this.props.show) {
      return null;
    }
    const { opinion, disabled } = this.props;
    return (
      <ButtonToolbar className="opinion__votes__buttons">
        <OpinionVotesButton disabled={disabled} opinion={opinion} value={1} />
        <OpinionVotesButton disabled={disabled} style={{ marginLeft: 5 }} opinion={opinion} value={0} />
        <OpinionVotesButton disabled={disabled} style={{ marginLeft: 5 }} opinion={opinion} value={-1} />
      </ButtonToolbar>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(OpinionVotesButtons);
