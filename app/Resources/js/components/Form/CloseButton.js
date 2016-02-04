import React from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

const CloseButton = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    label: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      label: 'global.cancel',
    };
  },

  render() {
    return (
      <Button onClick={this.props.onClose}>
        { this.getIntlMessage(this.props.label) }
      </Button>
    );
  },

});

export default CloseButton;
