// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import type { StyledComponent } from 'styled-components';
import component from '../../Form/Field';
import Toggle from '../../Form/Toggle';
import type { Dispatch, FeatureToggles, GlobalState, MediaFromAPI } from '~/types';
import { type ShieldAdminForm_shieldAdminForm } from '~relay/ShieldAdminForm_shieldAdminForm.graphql';
import UpdateShieldAdminFormInput from '../../../mutations/UpdateShieldAdminFormMutation';
import AlertForm from '../../Alert/AlertForm';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';
import { getTranslation, handleTranslationChange } from '~/services/Translation';

type FormValues = {|
  +shieldMode: boolean,
  +introduction: ?string,
  +media: ?MediaFromAPI,
|};

type Props = {|
  ...ReduxFormFormProps,
  intl: IntlShape,
  shieldAdminForm: ShieldAdminForm_shieldAdminForm,
  features: FeatureToggles,
  currentLanguage: string,
|};

const formName = 'shield-admin-form';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const translation = {
    locale: props.currentLanguage,
    introduction: values.introduction,
  };

  const input = {
    translations: handleTranslationChange(
      props.shieldAdminForm && props.shieldAdminForm.translations
        ? props.shieldAdminForm.translations
        : [],
      translation,
      props.currentLanguage,
    ),
    mediaId: values.media ? values.media.id : null,
    shieldMode: values.shieldMode,
  };

  return UpdateShieldAdminFormInput.commit({ input })
    .then(response => {
      if (!response.updateShieldAdminForm) {
        throw new Error('Mutation UpdateShieldAdminForm failed');
      }
      window.location.reload();
    })
    .catch(response => {
      if (response.message) {
        throw new SubmissionError({
          _error: response.message,
        });
      } else {
        throw new SubmissionError({
          _error: props.intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

const Title: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const ShieldAdminForm = (props: Props) => {
  const {
    features,
    handleSubmit,
    pristine,
    invalid,
    valid,
    submitSucceeded,
    submitFailed,
    submitting,
  } = props;

  return (
    <div className="box box-primary container-fluid">
      <div className="box-content box-content__content-form">
        <form onSubmit={handleSubmit} id={`${formName}`}>
          <Title>
            <h3 className="box-title">
              <FormattedMessage id="admin.label.pages.shield" />
            </h3>
            {features.unstable__multilangue && (
              <span className="mr-30 mt-15">
                <LanguageButtonContainer />
              </span>
            )}
          </Title>

          <div className="d-flex align-items-center mb-15">
            <Field
              id={`${formName}_shieldMode`}
              name="shieldMode"
              component={Toggle}
              label={<FormattedMessage id="capco.module.shield_mode" />}
            />
          </div>
          <Field
            id={`${formName}_introduction`}
            name="introduction"
            type="admin-editor"
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
                <FormattedMessage id="image.logo" />
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
    </div>
  );
};

const mapStateToProps = (state: GlobalState, { shieldAdminForm }: Props) => {
  const translation = getTranslation(
    shieldAdminForm && shieldAdminForm.translations ? shieldAdminForm.translations : [],
    state.language.currentLanguage,
  );

  return {
    currentLanguage: state.language.currentLanguage,
    initialValues: {
      shieldMode: shieldAdminForm.shieldMode,
      media: shieldAdminForm.media,
      introduction: translation ? translation.introduction : null,
    },
    features: state.default.features,
  };
};

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(ShieldAdminForm);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  shieldAdminForm: graphql`
    fragment ShieldAdminForm_shieldAdminForm on ShieldAdminForm {
      shieldMode
      translations {
        locale
        introduction
      }
      media {
        id
        url
        name
      }
    }
  `,
});
