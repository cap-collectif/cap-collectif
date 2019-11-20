// @flow
import * as React from 'react';
import { boolean, select, text, number } from 'storybook-addon-knobs';
import { ProgressBar } from 'react-bootstrap';
import { storiesOf } from '@storybook/react';
import { Progress } from '../../components/Ui/FeedbacksIndicators/Progress';

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

storiesOf('Core|ProgressBar', module).add('default', () => {
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
});
