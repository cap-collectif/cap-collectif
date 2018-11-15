// @flow
import * as React from 'react';
import { boolean, select, text, number } from '@storybook/addon-knobs';
import { Alert, ProgressBar } from 'react-bootstrap';
import { storiesOf } from '@storybook/react';
import { AlertForm } from '../components/Alert/AlertForm';
import { Loader } from '../components/Ui/FeedbacksIndicators/Loader';
import { Progress } from '../components/Ui/FeedbacksIndicators/Progress';

const bsStyleOptions = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
};

const classNameOptions = {
  grey: 'progress-bar_grey',
  empty: 'progress-bar_empty',
  Null: null,
};

const doFunction = () => {};

storiesOf('Feedbacks indicators', module)
  .add(
    'Alert',
    () => {
      const bsStyle = select('Style', bsStyleOptions, 'info');
      const content = text('Content', 'My content');
      const onDismiss = boolean('onDismiss', true);

      return (
        <Alert bsStyle={bsStyle} onDismiss={onDismiss ? doFunction : null}>
          {content}
        </Alert>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Form alert',
    () => {
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
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Progress bar',
    () => {
      const now = number('Now', 100);
      const className = select('ClassName', classNameOptions, null);
      const label = text('Label', 'My label');
      const striped = boolean('Striped', false);
      const bsStyle = select('BsStyke', bsStyleOptions, 'success');

      return (
        <Progress>
          <ProgressBar
            now={now}
            striped={striped}
            className={className}
            label={label}
            bsStyle={bsStyle}
          />
        </Progress>
      );
    },
    {
      info: {
        text: `
            Ce composant est utilisé ...
          `,
      },
    },
  )
  .add(
    'Loader',
    () => {
      const show = boolean('Show', true);

      return <Loader show={show} />;
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  );
