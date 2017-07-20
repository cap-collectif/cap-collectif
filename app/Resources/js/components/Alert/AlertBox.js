import React from 'react';
import { FormattedMessage } from 'react-intl';
import AlertStore from '../../stores/AlertStore';
import AlertAutoDismissable from './AlertAutoDismissable';

const AlertBox = React.createClass({
  getInitialState() {
    return {
      alert: null,
    };
  },

  componentWillMount() {
    AlertStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    AlertStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      alert: AlertStore.alert,
    });
  },

  handleDismiss() {
    this.setState({
      alert: null,
    });
  },

  render() {
    const { alert } = this.state;
    if (!alert) {
      return null;
    }

    return (
      <AlertAutoDismissable
        onDismiss={this.handleDismiss}
        bsStyle={alert.bsStyle}>
        <span>
          <FormattedMessage id={alert.content} />
        </span>
      </AlertAutoDismissable>
    );
  },
});

export default AlertBox;
