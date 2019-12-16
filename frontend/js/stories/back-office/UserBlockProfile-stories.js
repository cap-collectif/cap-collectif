// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from 'storybook-addon-knobs';

import { ProfileInfo } from '../../components/Ui/BackOffice/UserBlockProfile';
import ProfileNeutralIcon from '../../components/Ui/Icons/ProfileNeutralIcon';
import PowerButtonIcon from '../../components/Ui/Icons/PowerButtonIcon';
import IconLinkBar from '../../components/Ui/Icons/IconLinkBar';

storiesOf('Back office|UserBlockProfile', module).add('default case', () => {
  const name: string = text('userName', 'Booba');
  return (
    <div style={{ width: 220, margin: 'auto', boxShadow: '1px 1px 1px 1px' }}>
      <ProfileInfo>
        <img src="https://source.unsplash.com/random/60x60" alt="admin profile" />
        <div>{name}</div>
      </ProfileInfo>
      <IconLinkBar color="#333333" message="navbar.profile" url="/profile">
        <ProfileNeutralIcon color="#333333" />
      </IconLinkBar>
      <IconLinkBar
        color="#dc3545"
        message="global-disconnect"
        url={`${window.location.protocol}//${window.location.host}/logout`}>
        <PowerButtonIcon color="#dc3545" />
      </IconLinkBar>
    </div>
  );
});
