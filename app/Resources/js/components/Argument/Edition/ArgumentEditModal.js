import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import ArgumentForm, { formName } from './ArgumentForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeArgumentEditModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';

const ArgumentEditModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    argument: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
  },

  render() {
    const { argument, show, dispatch, submitting } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          dispatch(closeArgumentEditModal());
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="argument.update" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ArgumentForm argument={argument} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeArgumentEditModal());
            }}
          />
          <SubmitButton
            id="confirm-argument-update"
            label="global.edit"
            isSubmitting={submitting}
            onSubmit={() => {
              dispatch(submit(formName));
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});

export default connect((state: State, { argument }) => ({
  show: state.opinion.showArgumentEditModal === argument.id,
  submitting: isSubmitting(formName)(state)
}))(ArgumentEditModal);
