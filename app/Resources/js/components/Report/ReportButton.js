import React from 'react';
import LoginOverlay from '../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';

const ReportButton = React.createClass({
  propTypes: {
    reported: React.PropTypes.bool.isRequired,
    className: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
    bsSize: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      bsSize: 'md',
    };
  },

  render() {
    const { reported, className, onClick, bsSize } = this.props;
    const classes = {
      'btn--outline': true,
      'btn-dark-gray': true,
    };
    classes[className] = true;
    return (
      <LoginOverlay>
        <Button
          size={bsSize}
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
