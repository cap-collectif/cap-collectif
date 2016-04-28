import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import PhoneForm from './PhoneForm';
import SmsCodeForm from './SmsCodeForm';

const PhoneModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
      smsSentToNumber: null,
    };
  },

  onSubmitSuccess() {
    this.setState({ smsSentToNumber: '+12345678' });
    this.stopSubmit();
  },

  onCodeSuccess() {
    window.location.reload();
    this.props.onClose();
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  render() {
    const { isSubmitting, smsSentToNumber } = this.state;
    const { onClose, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        aria-labelledby="contained-modal-title-lg"
      >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {
                !smsSentToNumber ? 'Mobile' : 'Consultez votre téléphone'
              }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              !smsSentToNumber
               ? <p>
                   <strong>Ajouter votre numéro de téléphone</strong>
                   <br />
                   Nous allons envoyer un code de vérification à ce numéro. Des frais relatifs aux SMS peuvent s'appliquer.
                 </p>
              : <p>
                  Nous vous avons envoyé un code au Numéro de tel. Entrez-le ci-dessous afin de vérifier votre numéro.
                </p>
            }
            {
              !smsSentToNumber
              ? <PhoneForm
                  isSubmitting={isSubmitting}
                  onSubmitFailure={this.stopSubmit}
                  onSubmitSuccess={this.onSubmitSuccess}
                />
              : <SmsCodeForm
                  onSubmitSuccess={this.onCodeSuccess}
                />
            }
            {
              smsSentToNumber &&
              <a>Demander un nouveau code de validation</a>
            }
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={onClose} />
            {
              !smsSentToNumber &&
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
            }
          </Modal.Footer>
      </Modal>
    );
  },

});

export default PhoneModal;
