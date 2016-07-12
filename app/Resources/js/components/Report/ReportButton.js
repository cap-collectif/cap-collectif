import React, { PropTypes } from 'react';
import LoginOverlay from '../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';

export const ReportButton = React.createClass({
  displayName: 'ReportButton',
  propTypes: {
    id: PropTypes.string,
    reported: PropTypes.bool.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    bsSize: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      id: 'report-button',
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
          id={id}
          style={style}
          bsSize={bsSize}
          className={classNames(classes)}
          onClick={reported ? null : onClick}
          active={reported}
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

export default ReportButton;
