// @flow
import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import {
  hasSubmitFailed,
  hasSubmitSucceeded,
  isInvalid,
  isPristine,
  isSubmitting,
  isValid,
  reduxForm,
  submit,
  Field,
} from 'redux-form';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import type { DissociateSsoModal_viewer } from '~relay/DissociateSsoModal_viewer.graphql';
import component from '../../Form/Field';
import RemoveSsoMutation from '~/mutations/RemoveSsoMutation';
import type { Dispatch, GlobalState } from '~/types';
import { asyncPasswordValidate } from '../UserPasswordComplexityUtils';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import type { RemoveSsoMutationResponse, AvailableSso } from '~relay/RemoveSsoMutation.graphql';

const formName = 'dissociate-sso';

type FormValues = {
  plainPassword: ?string,
};

type RelayProps = {|
  viewer: DissociateSsoModal_viewer,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  show: boolean,
  title: string,
  service: AvailableSso,
  handleClose: () => void,
  dispatch: Dispatch,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    service: props.service,
    plainPassword: values.plainPassword,
  };

  return RemoveSsoMutation.commit({ input }).then((response: RemoveSsoMutationResponse) => {
    if (typeof response?.removeSso?.redirectUrl === 'string') {
      window.location.href = response.removeSso.redirectUrl;
    }
    dispatch(props.handleClose());
  });
};

const CreatePassword: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`;

export class DissociateSsoModal extends Component<Props> {
  render() {
    const { show, handleClose, viewer, valid, submitting, dispatch, title } = this.props;

    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          handleClose();
        }}
        bsSize="medium"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            <b>
              <FormattedMessage id="unlink-account" values={{ service: title }} />
            </b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="excerpt">
            <FormattedMessage id="unlink-account-next-step" values={{ service: title }} />
          </p>
          <CreatePassword>
            {!viewer.hasPassword && (
              <>
                <label className="col-sm-6 control-label p-0">
                  <p className="mb-0">
                    <FormattedMessage id="global.fullname" />
                  </p>
                </label>
                <span className="col-sm-9 mb-10 p-0">{viewer.username}</span>
                <label className="col-sm-6 control-label p-0">
                  <p className="mb-0">
                    <FormattedMessage id="global.email" />
                  </p>
                </label>
                <span className="col-sm-9  mb-10 p-0">{viewer.email}</span>
              </>
            )}
            <form name={formName} onSubmit={onSubmit}>
              <Field name="service" id="service" type="hidden" component={component} />
              {!viewer.hasPassword && (
                <>
                  <label className="col-sm-6 p-0" htmlFor="create-password">
                    <p className="mb-0">
                      <FormattedMessage id="registration.password" />
                    </p>
                  </label>
                  <Field
                    name="plainPassword"
                    divClassName="col-sm-9 p-0"
                    required
                    id="create-password"
                    type="password"
                    component={component}
                  />
                </>
              )}
            </form>
          </CreatePassword>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              handleClose();
            }}
          />
          <SubmitButton
            bsStyle="danger"
            className="ml-5"
            id="dissociate-confirm"
            isSubmitting={submitting}
            disabled={!valid || submitting}
            onSubmit={() => {
              dispatch(submit(formName));
            }}
            label={viewer.hasPassword ? 'global-unlink' : 'button-unlink'}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export const validate = (values: FormValues, props: Props) => {
  const errors = {};
  if (
    props.viewer &&
    !props.viewer.hasPassword &&
    (!values.plainPassword || values.plainPassword.length < 1)
  ) {
    errors.plainPassword = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
  }

  return errors;
};

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  return asyncPasswordValidate(formName, 'plainPassword', values, dispatch);
};

const mapStateToProps = (state: GlobalState, props: Props) => {
  return {
    pristine: isPristine(formName)(state),
    valid: isValid(formName)(state),
    invalid: isInvalid(formName)(state),
    submitting: isSubmitting(formName)(state),
    submitSucceeded: hasSubmitSucceeded(formName)(state),
    submitFailed: hasSubmitFailed(formName)(state),
    initialValues: {
      service: props.service,
    },
  };
};

const formContainer = reduxForm({
  form: formName,
  validate,
  asyncValidate,
  asyncChangeFields: ['plainPassword'],
  onSubmit,
})(DissociateSsoModal);

const container = connect(mapStateToProps)(formContainer);

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment DissociateSsoModal_viewer on User {
      username
      email
      hasPassword
    }
  `,
});
