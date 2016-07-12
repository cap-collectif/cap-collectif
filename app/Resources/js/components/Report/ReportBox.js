import React, { PropTypes } from 'react';
import ReportModal from './ReportModal';
import ReportButton from './ReportButton';
import { connect } from 'react-redux';
import { openModal } from '../../redux/modules/report';

export const ReportBox = React.createClass({
  displayName: 'ReportBox',
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired,
    reported: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
    author: PropTypes.object,
    buttonStyle: PropTypes.object,
    buttonBsSize: PropTypes.string,
    buttonClassName: PropTypes.string,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
    buttonId: PropTypes.string,
  },

  getDefaultProps() {
    return {
      buttonStyle: {},
      buttonId: 'report-button',
      author: null,
      buttonBsSize: null,
      buttonClassName: '',
      user: null,
    };
  },

  render() {
    const {
      onReport,
      dispatch,
      showModal,
      buttonId,
      reported,
      buttonBsSize,
      buttonClassName,
      user,
      author,
      features,
      buttonStyle,
    } = this.props;
    if (features.reporting && (!user || user.uniqueId !== author.uniqueId)) {
      return (
        <span>
          <ReportButton
            id={buttonId}
            reported={reported}
            onClick={() => dispatch(openModal())}
            bsSize={buttonBsSize}
            style={buttonStyle}
            className={buttonClassName}
          />
          <ReportModal
            show={showModal}
            onSubmit={onReport}
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
    showModal: state.report.showModal,
  };
};

export default connect(mapStateToProps)(ReportBox);
