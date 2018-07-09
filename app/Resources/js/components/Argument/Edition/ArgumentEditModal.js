// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import ArgumentForm, { formName } from './ArgumentForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeArgumentEditModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';
import type { ArgumentEditModal_argument } from './__generated__/ArgumentEditModal_argument.graphql';

type Props = {
  show: boolean,
  argument: ArgumentEditModal_argument,
  dispatch: Function,
  submitting: boolean,
};

class ArgumentEditModal extends React.Component<Props> {
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
            <FormattedMessage id="argument.update" />
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
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, { argument }) => ({
  show: argument ? state.opinion.showArgumentEditModal === argument.id : false,
  submitting: isSubmitting(formName)(state),
});

const container = connect(mapStateToProps)(ArgumentEditModal);
export default createFragmentContainer(
  container,
  graphql`
    fragment ArgumentEditModal_argument on Argument {
      id
      body
      ...ArgumentForm_argument
    }
  `,
);
