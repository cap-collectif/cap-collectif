// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector, reduxForm, SubmissionError } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import styled from 'styled-components';
import type { StyledComponent } from 'styled-components';
import type { RegistrationFormCommunication_registrationForm } from '~relay/RegistrationFormCommunication_registrationForm.graphql';
import type { FeatureToggles, State, Dispatch } from '../../types';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';
import renderInput from '~/components/Form/Field';
import UpdateRegistrationFormCommunicationMutation from '~/mutations/UpdateRegistrationFormCommunicationMutation';
import { getTranslation, handleTranslationChange } from '~/services/Translation';
import AlertForm from '~/components/Alert/AlertForm';

type Props = {|
  ...ReduxFormFormProps,
  registrationForm: RegistrationFormCommunication_registrationForm,
  intl: IntlShape,
  features: FeatureToggles,
  useTopText: boolean,
  useBottomText: boolean,
  currentLanguage: string,
|};

type FormValues = {|
  topTextDisplayed: boolean,
  topText: string,
  bottomTextDisplayed: boolean,
  bottomText: string,
|};

const Title: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const formName = 'registration-form-communication';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const translation = {
    locale: props.currentLanguage,
    topText: values.topText,
    bottomText: values.bottomText,
  };
  const input = {
    translations: handleTranslationChange(
      props.registrationForm && props.registrationForm.translations
        ? props.registrationForm.translations
        : [],
      translation,
      props.currentLanguage,
    ),
    topTextDisplayed: values.topTextDisplayed,
    bottomTextDisplayed: values.bottomTextDisplayed,
  };
  return UpdateRegistrationFormCommunicationMutation.commit({ input })
    .then(response => {
      if (!response.updateRegistrationFormCommunication) {
        throw new Error('Mutation "UpdateRegistrationFormCommunicationMutation" failed.');
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

export class RegistrationFormCommunication extends Component<Props> {
  render() {
    const {
      features,
      submitting,
      handleSubmit,
      useTopText,
      useBottomText,
      submitSucceeded,
      submitFailed,
    } = this.props;
    return (
      <div className="box box-primary container-fluid">
        <div className="box-content box-content__content-form">
          <form onSubmit={handleSubmit}>
            <Title>
              <h3 className="box-title">
                <FormattedMessage id="communication" />
              </h3>
              <span className="mr-30 mt-15">
                {features.multilangue && <LanguageButtonContainer />}
              </span>
            </Title>
            <Field
              type="checkbox"
              name="topTextDisplayed"
              children={<FormattedMessage id="registration.admin.topText" />}
              component={renderInput}
              id="display-message-above-form"
            />
            {useTopText && <Field name="topText" type="admin-editor" component={renderInput} />}
            <Field
              type="checkbox"
              name="bottomTextDisplayed"
              children={<FormattedMessage id="registration.admin.bottomText" />}
              component={renderInput}
              id="display-message-below-form"
            />
            {useBottomText && (
              <Field name="bottomText" type="admin-editor" component={renderInput} />
            )}
            <div className="box-content__toolbar btn-toolbar">
              <Button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? (
                  <FormattedMessage id="global.loading" />
                ) : (
                  <FormattedMessage id="global.save" />
                )}
              </Button>
              <AlertForm
                submitting={submitting}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(RegistrationFormCommunication);

const mapStateToProps = (state: State, { registrationForm }: Props) => {
  const translation = getTranslation(
    registrationForm && registrationForm.translations ? registrationForm.translations : [],
    state.language.currentLanguage,
  );

  return {
    currentLanguage: state.language.currentLanguage,
    initialValues: {
      topTextDisplayed: registrationForm.topTextDisplayed,
      topText: translation ? translation.topText : null,
      bottomTextDisplayed: registrationForm.bottomTextDisplayed,
      bottomText: translation ? translation.bottomText : null,
    },
    useTopText: formValueSelector(formName)(state, 'topTextDisplayed'),
    useBottomText: formValueSelector(formName)(state, 'bottomTextDisplayed'),
    features: state.default.features,
  };
};

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  registrationForm: graphql`
    fragment RegistrationFormCommunication_registrationForm on RegistrationForm {
      id
      topTextDisplayed
      bottomTextDisplayed
      translations {
        topText
        bottomText
        locale
      }
    }
  `,
});
