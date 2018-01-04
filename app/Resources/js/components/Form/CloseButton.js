// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Props = {
  onClose: () => any,
  label: string,
};

class CloseButton extends React.Component<Props> {
  static defaultProps = {
    label: 'global.cancel',
  };

  render() {
    const { label, onClose } = this.props;
    return (
      <Button onClick={onClose}>
        <FormattedMessage id={label} />
      </Button>
    );
  }
}

export default CloseButton;
