// @flow
import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import CloseButton from '../Form/CloseButton';
import { hideNewFieldModal } from '../../redux/modules/default';
import type { Dispatch, State } from '../../types';
import AddRegistrationQuestionForm, { formName } from './AddRegistrationQuestionForm';

export const AddRegistrationQuestionModal = React.createClass({
  propTypes: {
    submitting: PropTypes.bool.isRequired,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  },

  render() {
    const { submitting, show, onClose, onSubmit } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        autoFocus
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Ajouter un champ supplémentaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddRegistrationQuestionForm />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <Button
            id="confirm-new-question"
            type="submit"
            disabled={submitting}
            onClick={onSubmit}
            bsStyle="primary">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save" />
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
});

type Props = {
  submitting: boolean,
  show: boolean,
  onSubmit: (e: Event) => void,
  onClose: () => void
};

const mapStateToProps = (state: State) => ({
  submitting: isSubmitting(formName)(state),
  show: state.default.showNewFieldModal
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: (e: Event) => {
    e.preventDefault();
    dispatch(submit(formName));
  },
  onClose: () => {
    dispatch(hideNewFieldModal());
  }
});

const connector: Connector<{}, Props> = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddRegistrationQuestionModal);
