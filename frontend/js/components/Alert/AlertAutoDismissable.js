// @flow
import React from 'react';
import { Alert } from 'react-bootstrap';

type Props = {
  children: $FlowFixMe,
  onDismiss: () => void,
  bsStyle: string,
};

class AlertAutoDismissable extends React.Component<Props> {
  componentDidMount() {
    setTimeout(() => {
      const { onDismiss } = this.props;
      onDismiss();
    }, 10000);
  }

  render() {
    const { bsStyle, children, onDismiss } = this.props;
    return (
      <Alert
        className="text-center flash-notif"
        id="current-alert"
        bsStyle={bsStyle}
        onDismiss={onDismiss}>
        {children}
      </Alert>
    );
  }
}

export default AlertAutoDismissable;
