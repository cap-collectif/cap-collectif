// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm, type FormProps } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import component from '../../Form/Field';
import Toggle from '../../Form/Toggle';
import type { GlobalState, MediaFromAPI } from '../../../types';
import { type ShieldAdminForm_shieldAdminForm } from '~relay/ShieldAdminForm_shieldAdminForm.graphql';
import UpdateShieldAdminFormInput from '../../../mutations/UpdateShieldAdminFormMutation';
import AlertForm from '../../Alert/AlertForm';

type FormValues = {|
  +shieldMode: boolean,
  +introduction: ?string,
  +media: ?MediaFromAPI,
|};

type RelayProps = {|
  +shieldAdminForm: ShieldAdminForm_shieldAdminForm,
|};

type Props = {|
  ...RelayProps,
  ...FormProps,
|};

const formName = 'shield-admin-form';

const onSubmit = async (values: FormValues) => {
  const { media, ...rest } = values;

  const input = {
    mediaId: media ? media.id : null,
    ...rest,
  };

  return UpdateShieldAdminFormInput.commit({ input });
};

export const ShieldAdminForm = (props: Props) => {
  const {
    handleSubmit,
    pristine,
    invalid,
    valid,
    submitSucceeded,
    submitFailed,
    submitting,
  } = props;

  return (
    <div className="box-content box-content__content-form">
      <form onSubmit={handleSubmit} id={`${formName}`}>
        <div className="d-flex align-items-center mb-15">
          <Field
            id={`${formName}_shieldMode`}
            name="shieldMode"
            component={Toggle}
            label={
              <span>
                <FormattedMessage id="capco.module.shield_mode" />
              </span>
            }
          />
        </div>
        <Field
          id={`${formName}_introduction`}
          name="introduction"
          type="editor"
          component={component}
          label={
            <h4>
              <FormattedMessage id="shield.introduction" />
            </h4>
          }
        />
        <Field
          id={`${formName}_media`}
          name="media"
          component={component}
          type="image"
          label={
            <h4>
              <FormattedMessage id="image.shield" />
            </h4>
          }
        />
        <Button
          type="submit"
          id={`${formName}_submit`}
          bsStyle="primary"
          disabled={pristine || invalid || submitting}>
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
        <AlertForm
          valid={valid}
          invalid={invalid}
          submitting={submitting}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
        />
      </form>
    </div>
  );
};

const mapStateToProps = (state: GlobalState, { shieldAdminForm }: Props) => ({
  initialValues: {
    ...shieldAdminForm,
  },
});

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(ShieldAdminForm);

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  shieldAdminForm: graphql`
    fragment ShieldAdminForm_shieldAdminForm on ShieldAdminForm {
      shieldMode
      introduction
      media {
        id
        url
        name
      }
    }
  `,
});
