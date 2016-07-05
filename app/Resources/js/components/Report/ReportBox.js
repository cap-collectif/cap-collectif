import React, { PropTypes } from 'react';
import ReportModal from './ReportModal';
import ReportButton from './ReportButton';
import { connect } from 'react-redux';

const ReportBox = React.createClass({
  propTypes: {
    reported: PropTypes.bool,
    onReport: PropTypes.func.isRequired,
    author: PropTypes.object,
    buttonBsSize: PropTypes.string,
    buttonClassName: PropTypes.string,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
    buttonId: PropTypes.string,
  },

  getDefaultProps() {
    return {
      buttonId: 'report-button',
      reported: false,
      author: null,
      buttonBsSize: null,
      buttonClassName: '',
      user: null,
    };
  },

  getInitialState() {
    return {
      isReporting: false,
    };
  },

  openReportModal() {
    this.setState({ isReporting: true });
  },

  closeReportModal() {
    this.setState({ isReporting: false });
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.author.uniqueId;
  },

  report(data) {
    return this.props.onReport(data)
      .then(this.closeReportModal)
    ;
  },

  render() {
    const { isReporting } = this.state;
    if (this.props.user && !this.isTheUserTheAuthor() && this.props.features.reporting) {
      return (
        <span>
          <ReportButton
            id={this.props.buttonId}
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

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ReportBox);
