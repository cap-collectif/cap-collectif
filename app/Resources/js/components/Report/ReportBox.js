import React from 'react';
import LoginStore from '../../stores/LoginStore';
import FeatureStore from '../../stores/FeatureStore';
import ReportModal from './ReportModal';
import ReportButton from './ReportButton';

const ReportBox = React.createClass({
  propTypes: {
    reported: React.PropTypes.bool,
    onReport: React.PropTypes.func.isRequired,
    author: React.PropTypes.object,
    buttonBsSize: React.PropTypes.string,
    buttonClassName: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      reported: false,
      author: null,
      buttonBsSize: 'md',
      buttonClassName: '',
    };
  },

  getInitialState() {
    return {
      reportingEnabled: FeatureStore.isActive('reporting'),
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
      reportingEnabled: FeatureStore.isActive('reporting'),
    });
  },

  openReportModal() {
    this.setState({ isReporting: true });
  },

  closeReportModal() {
    this.setState({ isReporting: false });
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.author.uniqueId;
  },

  report(data) {
    this.props.onReport(data)
      .then(this.closeReportModal)
    ;
  },

  render() {
    const { reportingEnabled, isReporting } = this.state;
    if (LoginStore.isLoggedIn() && !this.isTheUserTheAuthor() && reportingEnabled) {
      return (
        <span>
          <ReportButton
            reported={this.props.reported}
            onClick={this.openReportModal}
            bsSize={this.props.buttonBsSize}
            className={this.props.buttonClassName}
          />
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

export default ReportBox;
