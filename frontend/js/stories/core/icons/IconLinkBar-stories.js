// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import IconLinkBar from '../../../components/Ui/Icons/IconLinkBar';
import ProfileNeutralIcon from '../../../components/Ui/Icons/ProfileNeutralIcon';
import PowerButtonIcon from '../../../components/Ui/Icons/PowerButtonIcon';
import EarthIcon from '../../../components/Ui/Icons/EarthIcon';

storiesOf('Core|Icons/IconLinkBar', module)
  .add('default', () => (
    <IconLinkBar color="#333333" message="navbar.profile" url="/profile">
      <ProfileNeutralIcon color="#333333" />
    </IconLinkBar>
  ))
  .add('stacked', () => (
    <div style={{ width: 220, margin: 'auto', border: '1px solid' }}>
      <IconLinkBar color="#333333" message="navbar.profile" url="/profile">
        <ProfileNeutralIcon color="#333333" />
      </IconLinkBar>
      <IconLinkBar
        color="#dc3545"
        message="global-disconnect"
        url={`${window.location.protocol}//${window.location.host}/logout`}>
        <PowerButtonIcon color="#dc3545" />
      </IconLinkBar>
      <IconLinkBar color="green" message="Oe la terre" url="/profile">
        <EarthIcon color="green" />
      </IconLinkBar>
    </div>
  ));
