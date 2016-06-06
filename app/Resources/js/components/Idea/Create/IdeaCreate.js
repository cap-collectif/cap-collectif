import React from 'react';
import { IntlMixin } from 'react-intl';
import IdeaCreateButton from './IdeaCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import IdeaCreateForm from './IdeaCreateForm';
import IdeaActions from '../../../actions/IdeaActions';
import { Modal } from 'react-bootstrap';

const IdeaCreate = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    themeId: React.PropTypes.number,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      themeId: -1,
    };
  },

  getInitialState() {
    return {
      showModal: false,
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
    if (this.props.themeId !== -1) {
      location.reload();
    }
    IdeaActions.load();
  },

  close() {
    this.setState({ showModal: false });
  },

  show() {
    this.setState({ showModal: true });
  },

  render() {
    return (
      <div className={this.props.className}>
        <IdeaCreateButton
          handleClick={this.show}
        />
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('idea.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <IdeaCreateForm
              themes={this.props.themes}
              themeId={this.props.themeId}
              isSubmitting={this.state.isSubmitting}
              onSubmitSuccess={this.handleSubmitSuccess}
              onValidationFailure={this.handleFailure}
              onSubmitFailure={this.handleFailure}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id="confirm-idea-create"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default IdeaCreate;
