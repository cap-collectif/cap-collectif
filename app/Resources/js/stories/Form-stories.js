// @flow
import * as React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import Select from '../components/Ui/Form/Select/Select';
import SelectOption from '../components/Ui/Form/Select/SelectOption';

storiesOf('Form', module).add(
  'Select',
  () => {
    const label = text('Label', 'status');
    const firstOption = text('First option', 'open');
    const scndOption = text('Second option', 'close');
    const isSelected = boolean('First option is selected', true);

    return (
      <Select label={label}>
        <SelectOption isSelected={isSelected} value="first-option" onClick={() => {}}>
          {firstOption}
        </SelectOption>
        <SelectOption isSelected={false} value="second-option" onClick={() => {}}>
          {scndOption}
        </SelectOption>
      </Select>
    );
  },
  {
    info: {
      text: `
            <p>Emplacement Select : <code>import Avatar from ‘../Ui/Form/Select/Select’;</code></p>
            <p>Emplacement SelectOption : <code>import Avatar from ‘../Ui/Form/Select/SelectOption’;</code></p>
          `,
    },
  },
);
