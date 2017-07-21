import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames';
import LoginOverlay from '../Utils/LoginOverlay';

export const ReportButton = React.createClass({
  displayName: 'ReportButton',
  propTypes: {
    id: PropTypes.string.isRequired,
    reported: PropTypes.bool.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    bsSize: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      style: {},
      bsSize: null,
    };
  },

  render() {
    const { reported, className, onClick, bsSize, id, style } = this.props;
    const classes = {
      'btn--outline': true,
      'btn-dark-gray': true,
    };
    classes[className] = true;
    return (
      <LoginOverlay>
        <Button
          id={`report-${id}-button`}
          style={style}
          bsSize={bsSize}
          className={classNames(classes)}
          onClick={reported ? null : onClick}
          active={reported}
          disabled={reported}
        >
          <i className="cap cap-flag-1"></i>
          { ' ' }
          {
            reported
              ? this.getIntlMessage('global.report.reported')
              : this.getIntlMessage('global.report.submit')
          }
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state, ownProps) => {
  return {
    reported: ownProps.reported || state.report.elements.includes(ownProps.id),
  };
};

export default connect(mapStateToProps)(ReportButton);
