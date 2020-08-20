// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { FieldArray } from 'redux-form';
import renderResponses from '~/components/Form/RenderResponses';
import type { ModalRegistrationFormQuestions_registrationForm } from '~relay/ModalRegistrationFormQuestions_registrationForm.graphql';

type Props = {
  change: (field: string, value: any) => void,
  responses: Array<Object>,
  form: string,
  memoizeAvailableQuestions: any,
  registrationForm: ModalRegistrationFormQuestions_registrationForm,
};

export const ModalRegistrationFormQuestions = ({
  change,
  responses,
  form,
  registrationForm,
  memoizeAvailableQuestions,
}: Props) => {
  const intl = useIntl();
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    'availableQuestions',
  );

  return (
    <FieldArray
      name="responses"
      change={change}
      questions={registrationForm?.questions || []}
      responses={responses}
      form={form}
      component={renderResponses}
      intl={intl}
      availableQuestions={availableQuestions}
      memoize={memoizeAvailableQuestions}
    />
  );
};

export default createFragmentContainer(ModalRegistrationFormQuestions, {
  registrationForm: graphql`
    fragment ModalRegistrationFormQuestions_registrationForm on RegistrationForm {
      questions {
        ...responsesHelper_question @relay(mask: false)
      }
    }
  `,
});
