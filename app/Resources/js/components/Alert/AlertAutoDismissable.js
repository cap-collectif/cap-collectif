import React, { PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

const AlertAutoDismissable = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
    onDismiss: PropTypes.func.isRequired,
    bsStyle: PropTypes.string.isRequired
  },

  componentDidMount() {
    setTimeout(() => {
      this.props.onDismiss();
    }, 10000);
  },

  render() {
    const { bsStyle, children, onDismiss } = this.props;
    return (
      <Alert className="text-center" id="current-alert" bsStyle={bsStyle} onDismiss={onDismiss}>
        {children}
      </Alert>
    );
  }
});

export default AlertAutoDismissable;
