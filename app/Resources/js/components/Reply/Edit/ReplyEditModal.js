// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ReplyForm from '../Form/ReplyForm';

type Props = {
  form: Object,
  reply: Object,
  show: boolean,
  onToggleModal: Function,
};

type State = {
  isSubmitting: boolean,
};

class ReplyEditModal extends React.Component<Props, State> {
  state = {
    isSubmitting: false,
  };

  close = () => {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  };

  show = () => {
    const { onToggleModal } = this.props;
    onToggleModal(true);
  };

  handleSubmit = () => {
    this.setState({
      isSubmitting: true,
    });
  };

  handleSubmitSuccess = () => {
    this.setState({
      isSubmitting: false,
    });
    this.close();
  };

  handleFailure = () => {
    this.setState({
      isSubmitting: false,
    });
  };

  render() {
    const { form, reply, show } = this.props;
    if (!form.contribuable) {
      return null;
    }
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {<FormattedMessage id="global.edit" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div id="edit-reply-form">
              <ReplyForm
                form={form}
                reply={reply}
                isSubmitting={this.state.isSubmitting}
                onSubmitSuccess={this.handleSubmitSuccess}
                onSubmitFailure={this.handleFailure}
                onValidationFailure={this.handleFailure}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id="submit-edit-reply"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ReplyEditModal;
