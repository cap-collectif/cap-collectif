// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ShareButton from '../../../components/Ui/Button/ShareButton';
import ShareButtonAction from '../../../components/Ui/Button/ShareButtonAction';

// Share Button components parametrable
const ShareButtonDropDown = ({ type }: { type: Object }) => (
  <ShareButton id="shareButton" bsSize={type.size} outline={type.outline} grey={type.grey}>
    <ShareButtonAction action="email" />
    <ShareButtonAction action="facebook" />
    <ShareButtonAction action="twitter" />
    <ShareButtonAction action="linkedin" />
    <ShareButtonAction action="link" />
  </ShareButton>
);

storiesOf('Core|Buttons/ShareButton', module)
  .add('default', () => {
    const type = {
      size: '',
    };

    return <ShareButtonDropDown type={type} />;
  })
  .add('xs size', () => {
    const type = {
      size: 'xs',
      outline: true,
      grey: true,
    };

    return <ShareButtonDropDown type={type} />;
  });
