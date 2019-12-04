// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import SocialIcon from '../../../components/Ui/Icons/SocialIcon';

storiesOf('Core|Icons/SocialIcon', module).add('default', () => <SocialIcon name="facebook" />, {
  info: {
    text: 'Le composant peut prendre les mêmes props que le composant Icon.',
  },
});
