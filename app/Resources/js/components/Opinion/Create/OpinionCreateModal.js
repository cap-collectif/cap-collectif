import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import OpinionCreateForm from '../Form/OpinionCreateForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';

const OpinionCreateModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    opinionType: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.form.form.submit();
    this.setState({ isSubmitting: true });
  },

  handleSubmitSuccess() {
    this.setState({ isSubmitting: false });
    this.props.onClose();
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show, opinionType } = this.props;
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
            { this.getIntlMessage('opinion.add_new') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-top bg-info">
            <p>
              { this.getIntlMessage('opinion.add_new_infos') }
            </p>
          </div>
          <OpinionCreateForm
            ref={c => this.form = c}
            opinionType={opinionType}
            onSubmitSuccess={this.handleSubmitSuccess}
            onFailure={this.stopSubmit}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            label="global.create"
            id={'confirm-opinion-create'}
            isSubmitting={isSubmitting}
            onSubmit={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default OpinionCreateModal;
