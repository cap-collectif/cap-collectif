import React from 'react';
import LoginOverlay from '../Utils/LoginOverlay';
import LoginStore from '../../stores/LoginStore';
import FeatureStore from '../../stores/FeatureStore';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

const OpinionReportButton = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      reporting: FeatureStore.isActive('reporting'),
    };
  },

  componentWillMount() {
    FeatureStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    FeatureStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      reporting: FeatureStore.isActive('reporting'),
    });
  },

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.opinion.author.uniqueId;
  },

  render() {
    const reported = this.props.opinion.has_user_reported;
    if (this.state.reporting && !this.isTheUserTheAuthor()) {
      return (
        <LoginOverlay>
          <Button
            className="opinion__action--report pull-right btn--outline btn-dark-gray"
            href={reported ? null : this.props.opinion._links.report}
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

export default OpinionReportButton;
