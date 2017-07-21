// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';

const OpinionSourceFormModalTitle = React.createClass({
  propTypes: {
    action: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { action } = this.props;
    return (
      <Modal.Title id="contained-modal-title-lg">
        {action === 'create'
          ? this.getIntlMessage('source.add')
          : this.getIntlMessage('source.update')}
      </Modal.Title>
    );
  },
});

export default OpinionSourceFormModalTitle;
