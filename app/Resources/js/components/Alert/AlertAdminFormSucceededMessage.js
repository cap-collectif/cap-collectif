import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {};

type State = {
  showSucceededMessage: boolean,
};

export class AlertAdminFormSucceededMessage extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showSucceededMessage: true,
    };
  }

  componentDidMount() {
    this.showDelayMessage();
  }

  showDelayMessage() {
    setTimeout(() => {
      this.setState({
        showSucceededMessage: false,
      });
    }, 10000);
  }

  render() {
    const { showSucceededMessage } = this.state;

    if (showSucceededMessage) {
      return (
        <div className="alert__admin-form_succeeded-message">
          <i className="icon ion-android-checkmark-circle" /> <FormattedMessage id="global.saved" />
        </div>
      );
    }

    return null;
  }
}

export default AlertAdminFormSucceededMessage;
