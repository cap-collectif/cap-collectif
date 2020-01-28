// @flow
import React from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import AlertStore from '~/stores/AlertStore';
import AlertAutoDismissable from './AlertAutoDismissable';
import Alert from './Alert';

export type Props = {||};

type State = {
  alert: ?Object,
};

class AlertBox extends React.Component<Props, State> {
  state = {
    alert: null,
  };

  componentWillMount() {
    AlertStore.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    AlertStore.removeChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState({
      alert: AlertStore.alert,
    });
  };

  handleDismiss = (): void => {
    this.setState({
      alert: null,
    });
  };

  render() {
    const { alert } = this.state;

    return alert ? (
      alert.bsStyle ? (
        <AlertAutoDismissable onDismiss={this.handleDismiss} bsStyle={alert.bsStyle}>
          <FormattedHTMLMessage id={alert.content} values={alert.values} />
        </AlertAutoDismissable>
      ) : (
        <Alert onDismiss={this.handleDismiss} type={alert.type}>
          <FormattedHTMLMessage id={alert.content} values={alert.values} />
        </Alert>
      )
    ) : null;
  }
}

export default AlertBox;
