// @flow
import * as React from 'react';
import { Field, reduxForm, submit } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import type { Dispatch } from '~/types';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import component from '~/components/Form/Field';
import { isEmail } from '~/services/Validator';
import TestEmailingCampaignMutation from '~/mutations/TestEmailingCampaignMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import { type ModalMailTest_emailingCampaign } from '~relay/ModalMailTest_emailingCampaign.graphql';

type Values = {|
  mailAddressee: string,
|};

type Props = {|
  ...ReduxFormFormProps,
  show: boolean,
  onClose: () => void,
  dispatch: Dispatch,
  emailingCampaign: ModalMailTest_emailingCampaign,
|};

const formName = 'form-mail-test';

const onSubmit = ({ mailAddressee }: Values, dispatch: Dispatch, props: Props) => {
  const { onClose, emailingCampaign } = props;

  return TestEmailingCampaignMutation.commit({
    input: {
      id: emailingCampaign.id,
      email: mailAddressee,
    },
  })
    .then(response => {
      onClose();

      if (response.testEmailingCampaign?.error) {
        return FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        });
      }

      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.SUCCESS,
          content: 'contact.email.sent_success',
        },
      });
    })
    .catch(() => {
      onClose();
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      });
    });
};

const validate = ({ mailAddressee }: Values) => {
  const errors = {};

  if (!mailAddressee || !isEmail(mailAddressee)) {
    errors.mailAddressee = 'global.constraints.email.invalid';
  }

  return errors;
};

export const ModalMailTest = ({ show, onClose, dispatch, pristine, invalid }: Props) => (
  <Modal
    animation={false}
    show={show}
    onHide={onClose}
    bsSize="large"
    aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">
        <FormattedMessage id="send-test-by-mail" />
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <form>
        <Field
          type="text"
          id="mailAddressee"
          name="mailAddressee"
          component={component}
          label={<FormattedMessage id="addressee-address" />}
        />
      </form>
    </Modal.Body>

    <Modal.Footer>
      <CloseButton onClose={onClose} label="editor.undo" />
      <SubmitButton
        label="send-test"
        onSubmit={() => dispatch(submit(formName))}
        bsStyle="primary"
        disabled={pristine || invalid}
      />
    </Modal.Footer>
  </Modal>
);

const ModalMailTestForm = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ModalMailTest);

const ModalMailTestConnected = connect()(ModalMailTestForm);

export default createFragmentContainer(ModalMailTestConnected, {
  emailingCampaign: graphql`
    fragment ModalMailTest_emailingCampaign on EmailingCampaign {
      id
    }
  `,
});
