import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReportModal from './ReportModal';
import ReportButton from './ReportButton';
import { openModal } from '../../redux/modules/report';

export const ReportBox = React.createClass({
  displayName: 'ReportBox',
  propTypes: {
    id: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired,
    reported: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
    user: PropTypes.object,
    author: PropTypes.object,
    buttonStyle: PropTypes.object,
    buttonBsSize: PropTypes.string,
    buttonClassName: PropTypes.string
  },

  getDefaultProps() {
    return {
      buttonStyle: {},
      author: null,
      buttonBsSize: null,
      buttonClassName: '',
      user: null
    };
  },

  render() {
    const {
      id,
      onReport,
      dispatch,
      showModal,
      reported,
      buttonBsSize,
      buttonClassName,
      user,
      author,
      features,
      buttonStyle
    } = this.props;
    if (features.reporting && (!user || !author || user.uniqueId !== author.uniqueId)) {
      return (
        <span>
          <ReportButton
            id={id}
            reported={reported}
            onClick={() => dispatch(openModal(id))}
            bsSize={buttonBsSize}
            style={buttonStyle}
            className={buttonClassName}
          />
          <ReportModal id={id} show={showModal} onSubmit={onReport} />
        </span>
      );
    }
    return null;
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    features: state.default.features,
    user: state.user.user,
    showModal: state.report.currentReportingModal === ownProps.id
  };
};

export default connect(mapStateToProps)(ReportBox);
