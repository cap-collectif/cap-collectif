import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const CloseButton = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    label: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      label: 'global.cancel',
    };
  },

  render() {
    const { label, onClose } = this.props;
    return <Button onClick={onClose}>{<FormattedMessage id={label} />}</Button>;
  },
});

export default CloseButton;
