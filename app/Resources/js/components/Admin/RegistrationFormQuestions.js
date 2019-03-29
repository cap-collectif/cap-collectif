// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type { RegistrationFormQuestions_registrationForm } from '~relay/RegistrationFormQuestions_registrationForm.graphql';
import type { State } from '../../types';
import ProposalFormAdminQuestions from '../ProposalForm/ProposalFormAdminQuestions';
import UpdateRegistrationFormQuestionsMutation from '../../mutations/UpdateRegistrationFormQuestionsMutation';
import AlertForm from '../Alert/AlertForm';
import { submitQuestion } from '../../utils/submitQuestion';

type Props = {|
  ...FormProps,
  // eslint-disable-next-line react/no-unused-prop-types
  registrationForm: RegistrationFormQuestions_registrationForm,
  // eslint-disable-next-line react/no-unused-prop-types
  intl: IntlShape,
|};

const formName = 'registration-form-questions';

const onSubmit = (values: Object) => {
  const input = {
    questions: submitQuestion(values.questions),
  };

  return UpdateRegistrationFormQuestionsMutation.commit({ input });
};

class RegistrationFormQuestions extends Component<Props> {
  render() {
    const {
      invalid,
      pristine,
      submitting,
      handleSubmit,
      valid,
      submitSucceeded,
      submitFailed,
    } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <FieldArray
          name="questions"
          component={ProposalFormAdminQuestions}
          formName={formName}
          hideSections
        />
        <Button
          disabled={invalid || pristine || submitting}
          type="submit"
          bsStyle="primary"
          id="proposal-form-admin-content-save">
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
    );
  }
}

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(RegistrationFormQuestions);

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: props.registrationForm,
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment RegistrationFormQuestions_registrationForm on RegistrationForm {
      id
      questions {
        id
        ...responsesHelper_adminQuestion @relay(mask: false)
      }
    }
  `,
);
