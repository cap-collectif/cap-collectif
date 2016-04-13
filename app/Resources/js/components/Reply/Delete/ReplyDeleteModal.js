import React from 'react';
import { IntlMixin } from 'react-intl';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import { Modal } from 'react-bootstrap';
import ReplyActions from '../../../actions/ReplyActions';

const ReplyDeleteModal = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    reply: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
    ReplyActions
      .delete(this.props.form.id, this.props.reply.id)
      .then(() => {
        this.close();
        this.props.onDelete();
      })
      .catch(() => {
        this.setState({ isSubmitting: false });
      })
    ;
  },

  close() {
    this.props.onToggleModal(false);
  },

  show() {
    this.props.onToggleModal(true);
  },

  render() {
    return (
      <div>
        <Modal
          id={'delete-reply-modal-' + this.props.reply.id}
          className="reply__modal--delete"
          animation={false}
          show={this.props.show}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('global.remove') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              {this.getIntlMessage('reply.delete.confirm')}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id={'reply-confirm-delete-button' + this.props.reply.id}
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
  },

});

export default ReplyDeleteModal;
