import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import OpinionEditForm, { formName } from '../Form/OpinionEditForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State } from '../../../types';

export const OpinionEditModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    opinion: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { dispatch, submitting, onClose, show, opinion, step } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            window.confirm(this.getIntlMessage('proposal.confirm_close_modal'))
          ) {
            // eslint-disable-line no-alert
            onClose();
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {this.getIntlMessage('global.edit')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OpinionEditForm opinion={opinion} step={step} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            label="global.edit"
            id={'confirm-opinion-update'}
            isSubmitting={submitting}
            onSubmit={() => {
              dispatch(submit(formName));
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  },
});

export default connect(
  (state: State) => {
    return {
      submitting: isSubmitting(formName)(state),
      step: state.project.projectsById[
        state.project.currentProjectById
      ].steps.filter(step => step.type === 'consultation')[0],
    };
  },
  null,
  null,
  { withRef: true },
)(OpinionEditModal);
