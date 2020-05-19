// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from '~/components/Ui/Form/Input/Checkbox/Checkbox';
import Radio, { COLORS } from '~/components/Ui/Form/Input/Radio/Radio';
import TextArea from '~/components/Ui/Form/Input/TextArea/TextArea';
import Input from '~/components/Ui/Form/Input/Input';
import Dropzone from '~/components/Ui/Form/Dropzone/Dropzone';
import Toggle from '~/components/Ui/Toggle/Toggle';

/* ------ INPUT ------ */

storiesOf('Core|Form/Input', module).add('Default', () => {
  return <Input type="text" id="1" name="test" value="Hello world" />;
});

storiesOf('Core|Form/Input', module).add('Disabled', () => {
  return <Input type="text" id="1" name="test" value="Hello world" disabled />;
});

storiesOf('Core|Form/Input', module).add('Number', () => {
  return <Input type="number" id="1" name="test" value={12} />;
});

/* ------ END INPUT ------ */

/* ------ CHECKBOX ------ */

storiesOf('Core|Form/Checkbox', module).add('Default', () => {
  return <Checkbox label="Je ne suis pas checked" id="1" name="test" value="test1" />;
});

storiesOf('Core|Form/Checkbox', module).add('Checked', () => {
  return <Checkbox label="Je suis checked" id="2" name="test" value="test2" checked />;
});

storiesOf('Core|Form/Checkbox', module).add('With image', () => {
  return (
    <Checkbox id="1" name="test" image="https://i.picsum.photos/id/74/300/200.jpg" value="test1" />
  );
});

storiesOf('Core|Form/Checkbox', module).add('With image checked', () => {
  return (
    <Checkbox
      id="1"
      name="test"
      image="https://i.picsum.photos/id/74/300/200.jpg"
      value="test1"
      checked
    />
  );
});

/* ------ END CHECKBOX ------ */

/* ------ RADIO ------ */

storiesOf('Core|Form/Radio', module).add('Default', () => {
  return <Radio label="Je ne suis pas checked" id="1" name="test" value="test1" />;
});

storiesOf('Core|Form/Radio', module).add('Checked', () => {
  return <Radio label="Je suis checked" id="2" name="test" value="test2" checked />;
});

storiesOf('Core|Form/Radio', module).add('With image', () => {
  return (
    <Radio id="1" name="test" image="https://i.picsum.photos/id/74/300/200.jpg" value="test1" />
  );
});

storiesOf('Core|Form/Radio', module).add('With image checked', () => {
  return (
    <Radio
      id="1"
      name="test"
      image="https://i.picsum.photos/id/74/300/200.jpg"
      value="test1"
      checked
    />
  );
});

/* ------ END RADIO ------ */

/* ------ RADIO BUTTON ------ */

storiesOf('Core|Form/RadioButton', module).add('Default', () => {
  return (
    <Radio
      label="Je ne suis pas checked"
      id="2"
      name="test"
      value="test2"
      color={COLORS.SUCCESS}
      isButton
    />
  );
});

storiesOf('Core|Form/RadioButton', module).add('Checked', () => {
  return (
    <Radio
      label="Je suis checked"
      id="2"
      name="test"
      value="test2"
      color={COLORS.SUCCESS}
      checked
      isButton
    />
  );
});

storiesOf('Core|Form/RadioButton', module).add('All', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Radio
        label="Je ne suis pas checked"
        id="1"
        name="test"
        value="test1"
        color={COLORS.SUCCESS}
        isButton
      />
      <Radio
        label="Je ne suis pas checked"
        id="2"
        name="test"
        value="test2"
        color={COLORS.INFO}
        isButton
      />
      <Radio
        label="Je ne suis pas checked"
        id="3"
        name="test"
        value="test3"
        color={COLORS.WARNING}
        isButton
      />
      <Radio
        label="Je ne suis pas checked"
        id="4"
        name="test"
        value="test4"
        color={COLORS.DANGER}
        isButton
      />
      <Radio
        label="Je ne suis pas checked"
        id="5"
        name="test"
        value="test5"
        color={COLORS.PRIMARY}
        isButton
      />
    </div>
  );
});

/* ------ END RADIO BUTTON ------ */

/* ------ TEXTAREA ------ */

storiesOf('Core|Form/TextArea', module).add('Default', () => {
  return <TextArea id="1" name="test" />;
});

storiesOf('Core|Form/TextArea', module).add('Disabled', () => {
  return <TextArea id="1" name="test" disabled />;
});

/* ------ END TEXTAREA ------ */

/* ------ DROPZONE ------ */

storiesOf('Core|Form/Dropzone', module).add('Default', () => {
  return (
    <Dropzone
      value={null}
      onChange={() => {}}
      setError={() => {}}
      errors={{
        DEFAULT: ['wording key', 'wording key'],
        MAX_FILE: ['wording key', 'wording key'],
      }}
    />
  );
});

/* ------ END DROPZONE ------ */

/* ------ TOGGLE ------ */

storiesOf('Core|Form/Toggle', module).add('Default', () => {
  return (
    <>
      <Toggle checked />
      <Toggle />
    </>
  );
});

/* ------ END TOGGLE ------ */
