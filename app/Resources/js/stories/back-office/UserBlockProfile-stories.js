// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from 'storybook-addon-knobs';
import { UserBlockProfile } from '../../components/Ui/BackOffice/UserBlockProfile';

storiesOf('Back office|UserBlockProfile', module).add('default case (in dropdown)', () => {
  return (
    <div style={{ width: 200, margin: 'auto', boxShadow: '1px 1px 1px 1px' }}>
      <UserBlockProfile
        profileUrl=""
        userImage="https://source.unsplash.com/random/60x60"
        userName={text('userName', 'John Doe')}
      />
    </div>
  );
});
