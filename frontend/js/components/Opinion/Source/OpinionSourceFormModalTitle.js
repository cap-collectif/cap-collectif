// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';

type Props = { action: string };

class OpinionSourceFormModalTitle extends React.Component<Props> {
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
}

export default OpinionSourceFormModalTitle;
