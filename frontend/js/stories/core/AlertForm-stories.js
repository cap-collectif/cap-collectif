// @flow
import * as React from 'react';
import { boolean, text } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import { AlertForm } from '../../components/Alert/AlertForm';

storiesOf('Core|Form/AlertForm', module).add('default', () => {
  const valid = boolean('Valid', true);
  const invalid = boolean('Invalid', false);
  const submitSucceeded = boolean('SubmitSucceeded', true);
  const submitFailed = boolean('SubmitFailed', false);
  const submitting = boolean('Submitting', false);
  const errorMessage = text('Error message', null);

  return (
    <AlertForm
      valid={valid}
      invalid={invalid}
      submitSucceeded={submitSucceeded}
      submitFailed={submitFailed}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
});
