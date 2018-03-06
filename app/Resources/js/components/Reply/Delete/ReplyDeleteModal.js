import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ReplyActions from '../../../actions/ReplyActions';

const ReplyDeleteModal = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    reply: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      isSubmitting: false
    };
  },

  handleSubmit() {
    const { form, onDelete, reply } = this.props;
    this.setState({ isSubmitting: true });
    ReplyActions.delete(form.id, reply.id)
      .then(() => {
        this.close();
        onDelete();
      })
      .catch(() => {
        this.setState({ isSubmitting: false });
      });
  },

  close() {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  },

  show() {
    const { onToggleModal } = this.props;
    onToggleModal(true);
  },

  render() {
    const { reply, show } = this.props;
    return (
      <div>
        <Modal
          id={`delete-reply-modal-${reply.id}`}
          className="reply__modal--delete"
          animation={false}
          show={show}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {<FormattedMessage id="global.remove" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{<FormattedMessage id="reply.delete.confirm" />}</p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id={`reply-confirm-delete-button${reply.id}`}
              className="reply__confirm-delete-btn"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
              label="global.remove"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

export default ReplyDeleteModal;
