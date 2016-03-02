import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

import ArgumentStore from '../../../stores/ArgumentStore';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import ArgumentActions from '../../../actions/ArgumentActions';

const ArgumentDeleteModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    argument: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
    ArgumentActions
      .delete(ArgumentStore.opinion, this.props.argument.id)
      .then(() => {
        this.props.onClose();
        this.setState({ isSubmitting: false });
        ArgumentActions.load(ArgumentStore.opinion, this.props.argument.type);
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
        onHide={onClose}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
              {this.getIntlMessage('argument.delete.modal.title')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="h4">
            {this.getIntlMessage('argument.delete.modal.bold')}
          </p>
          <div>
            {this.getIntlMessage('argument.delete.modal.infos')}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
            <SubmitButton
              id={'confirm-argument-delete'}
              label={'global.delete'}
              isSubmitting={isSubmitting}
              onSubmit={this.handleSubmit.bind(null, this)}
              bsStyle="danger"
            />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default ArgumentDeleteModal;
