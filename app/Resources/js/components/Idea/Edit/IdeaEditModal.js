import React from 'react';
import { IntlMixin } from 'react-intl';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import IdeaEditForm from './IdeaEditForm';
import { Modal } from 'react-bootstrap';

const IdeaEditModal = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    idea: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleFailure() {
    this.setState({ isSubmitting: false });
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  handleSubmitSuccess() {
    this.close();
    this.setState({ isSubmitting: false });
    location.reload();
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
          animation={false}
          show={this.props.show}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('global.edit') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <IdeaEditForm
              themes={this.props.themes}
              isSubmitting={this.state.isSubmitting}
              onSubmitSuccess={this.handleSubmitSuccess}
              onValidationFailure={this.handleFailure}
              onSubmitFailure={this.handleFailure}
              idea={this.props.idea}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id="confirm-idea-edit"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default IdeaEditModal;
