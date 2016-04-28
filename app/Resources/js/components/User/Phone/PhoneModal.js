import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import PhoneForm from './PhoneForm';

const PhoneModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
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
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
      >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              Mobile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong>Ajouter votre numéro de téléphone</strong>
            <p>Nous allons envoyer un code de vérification à ce numéro. Des frais relatifs aux SMS peuvent s'appliquer.</p>
            <PhoneForm
              isSubmitting={isSubmitting}
              onSubmitFailure={this.stopSubmit}
              onSubmitSuccess={onClose}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={onClose} />
            <Button
              id="confirm-continue"
              onClick={this.handleSubmit}
              disabled={isSubmitting}
              bsStyle="primary"
            >
              {isSubmitting
                ? this.getIntlMessage('global.loading')
                : <span>Continuer</span>
              }
            </Button>
          </Modal.Footer>
      </Modal>
    );
  },

});

export default PhoneModal;
