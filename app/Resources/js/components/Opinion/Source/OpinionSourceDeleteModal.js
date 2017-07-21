// @flow
import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

import OpinionSourceStore from '../../../stores/OpinionSourceStore';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';

const OpinionSourceDeleteModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    source: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    const { onClose, source } = this.props;
    this.setState({ isSubmitting: true });
    OpinionSourceActions.delete(OpinionSourceStore.opinion, source.id)
      .then(() => {
        onClose();
        this.setState({ isSubmitting: false });
        OpinionSourceActions.load(OpinionSourceStore.opinion, 'last');
      })
      .catch(() => {
        this.setState({ isSubmitting: false });
      });
  },

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose.bind(null, this)}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {this.getIntlMessage('source.delete_modal.title')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="h4">
            {this.getIntlMessage('source.delete_modal.bold')}
          </p>
          <div>
            {this.getIntlMessage('source.delete_modal.infos')}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id={'confirm-opinion-source-delete'}
            label={'global.delete'}
            isSubmitting={isSubmitting}
            onSubmit={() => {
              this.handleSubmit();
            }}
            bsStyle="danger"
          />
        </Modal.Footer>
      </Modal>
    );
  },
});

export default OpinionSourceDeleteModal;
