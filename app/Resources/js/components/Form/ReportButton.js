import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import LoginOverlay from '../Utils/LoginOverlay';
import { connect } from 'react-redux';

const ReportButton = React.createClass({
  propTypes: {
    url: PropTypes.string.isRequired,
    author: PropTypes.object,
    hasReported: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    id: PropTypes.string,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      author: null,
      hasReported: false,
      className: '',
      style: {},
      id: 'report-button',
      user: null,
    };
  },

  canReport() {
    return this.props.features.reporting && !this.isTheUserTheAuthor();
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.author.uniqueId;
  },

  render() {
    if (this.canReport()) {
      const reported = this.props.hasReported;
      const classes = {
        'btn-dark-gray': true,
        'btn--outline': true,
      };

      const { user, features } = this.props;
      return (
        <LoginOverlay user={user} features={features}>
          <Button
            id={this.props.id}
            href={this.props.url}
            style={this.props.style}
            active={reported}
            disabled={reported}
            className={classNames(classes, this.props.className)}
          >
            <i className="cap cap-flag-1"></i>
            {reported ? this.getIntlMessage('global.report.reported') : this.getIntlMessage('global.report.submit')}
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

export default connect(mapStateToProps)(ReportButton);
