import React, { PropTypes } from 'react';
import LoginOverlay from '../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';

const OpinionReportButton = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.opinion.author.uniqueId;
  },

  render() {
    const { features, opinion, user } = this.props;
    const reported = opinion.has_user_reported;
    if (features.reporting && !this.isTheUserTheAuthor()) {
      return (
        <LoginOverlay features={features} user={user}>
          <Button
            className="opinion__action--report pull-right btn--outline btn-dark-gray"
            href={reported || !user ? null : opinion._links.report}
            active={reported}
          >
            <i className="cap cap-flag-1"></i>
            { ' ' }
            { reported ? this.getIntlMessage('global.report.reported') : this.getIntlMessage('global.report.submit') }
          </Button>
        </LoginOverlay>
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

export default connect(mapStateToProps)(OpinionReportButton);
