import React from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import FeatureStore from '../../../stores/FeatureStore';
import LoginOverlay from '../../Utils/LoginOverlay';
import ReportModal from '../../Report/ReportModal';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';
import OpinionSourceStore from '../../../stores/OpinionSourceStore';

const OpinionSourceReportButton = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      reporting: FeatureStore.isActive('reporting'),
      isReporting: false,
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

  openReportModal() {
    this.setState({ isReporting: true });
  },

  closeReportModal() {
    this.setState({ isReporting: false });
  },

  isTheUserTheAuthor() {
    if (this.props.source.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.source.author.uniqueId;
  },

  report(data) {
    return OpinionSourceActions
      .report(OpinionSourceStore.opinion, this.props.source.id, data)
      .then(this.closeReportModal)
    ;
  },

  render() {
    const { reporting, isReporting } = this.state;
    if (!this.isTheUserTheAuthor() && reporting) {
      return (
        <span>
          <LoginOverlay>
            <Button
              bsSize="xsmall"
              className="source__btn--report btn-dark-gray btn--outline"
              onClick={LoginStore.isLoggedIn() ? this.openReportModal : null}
            >()
              <i className="cap cap-flag-1"></i>
              {this.getIntlMessage('global.report.submit')}
            </Button>
          </LoginOverlay>
          <ReportModal
            show={isReporting}
            onClose={this.closeReportModal}
            onSubmit={this.report}
          />
        </span>
      );
    }
    return null;
  },

});

export default OpinionSourceReportButton;
