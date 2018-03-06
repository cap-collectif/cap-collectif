// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';

const OpinionSourceFormModalTitle = React.createClass({
  propTypes: {
    action: PropTypes.string.isRequired
  },

  render() {
    const { action } = this.props;
    return (
      <Modal.Title id="contained-modal-title-lg">
        {action === 'create' ? (
          <FormattedMessage id="source.add" />
        ) : (
          <FormattedMessage id="source.update" />
        )}
      </Modal.Title>
    );
  }
});

export default OpinionSourceFormModalTitle;
