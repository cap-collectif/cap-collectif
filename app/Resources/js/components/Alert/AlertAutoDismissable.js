import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Alert } from 'react-bootstrap';

const AlertAutoDismissable = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
    onDismiss: PropTypes.func.isRequired,
    bsStyle: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      bsStyle,
      children,
      onDismiss,
    } = this.props;
    return (
      <Alert className="text-center" bsStyle={bsStyle} onDismiss={onDismiss} dismissAfter={10000}>
        {children}
      </Alert>
    );
  },

});

export default AlertAutoDismissable;
