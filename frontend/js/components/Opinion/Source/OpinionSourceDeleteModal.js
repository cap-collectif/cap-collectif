// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import FluxDispatcher from '../../../dispatchers/AppDispatcher';
import DeleteSourceMutation from '../../../mutations/DeleteSourceMutation';
import type { OpinionSourceDeleteModal_source } from '~relay/OpinionSourceDeleteModal_source.graphql';

type Props = {|
  +show: boolean,
  +source: OpinionSourceDeleteModal_source,
  +onClose: Function,
|};

const OpinionSourceDeleteModal = ({ onClose, source, show }: Props) => {
  const intl = useIntl();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    const input = {
      sourceId: source.id,
    };

    DeleteSourceMutation.commit({ input }, source.published)
      .then(res => {
        if (res.deleteSource && res.deleteSource.deletedSourceId) {
          FluxDispatcher.dispatch({
            actionType: 'UPDATE_ALERT',
            alert: { bsStyle: 'success', content: 'alert.success.delete.source' },
          });
          onClose();
        }
        setIsSubmitting(false);
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Modal
      animation={false}
      show={show}
      onHide={onClose.bind(null, this)}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="source.delete_modal.title" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="h4">
          <FormattedMessage id="source.delete_modal.bold" />
        </p>
        <div>
          <FormattedMessage id="content.delete" />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <SubmitButton
          id="confirm-opinion-source-delete"
          label="global.delete"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default createFragmentContainer(OpinionSourceDeleteModal, {
  source: graphql`
    fragment OpinionSourceDeleteModal_source on Source {
      id
      published
    }
  `,
});
