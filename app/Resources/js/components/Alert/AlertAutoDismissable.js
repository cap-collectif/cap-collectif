import React, {PropTypes} from 'react';
import {IntlMixin} from 'react-intl';
import {Alert} from 'react-bootstrap';

const AlertAutoDismissable = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
    onDismiss: PropTypes.func.isRequired,
    bsStyle: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <Alert bsStyle={this.props.bsStyle} onDismiss={this.props.onDismiss} dismissAfter={4000}>
        {this.props.children}
      </Alert>
    );
  },

});

export default AlertAutoDismissable;
