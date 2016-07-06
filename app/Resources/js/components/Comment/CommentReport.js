import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';

const CommentReport = React.createClass({
  propTypes: {
    comment: PropTypes.object,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  isTheUserTheAuthor() {
    if (this.props.comment.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.comment.author.uniqueId;
  },

  render() {
    if (this.props.features.reporting && !this.isTheUserTheAuthor()) {
      if (this.props.comment.has_user_reported) {
        return (
          <button disabled="disabled" className="btn btn-xs btn-dark-gray">
            <i className="cap cap-flag-1"></i>
            { ' ' }
            { this.getIntlMessage('comment.report.reported') }
          </button>
        );
      }

      return (
        <a href={this.props.comment._links.report} className="btn btn-xs btn-dark-gray btn--outline">
          <i className="cap cap-flag-1"></i>
          { ' ' }
          { this.getIntlMessage('comment.report.submit') }
        </a>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(CommentReport);
