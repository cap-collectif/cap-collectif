// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, number, color } from 'storybook-addon-knobs';

import SiteLanguageChangeButton from '../../../components/Ui/Button/SiteLanguageChangeButton';

const props = {
  onChange: () => {},
  defaultLanguage: 'Français',
  languageList: ['Français', 'English', 'Español', 'Deutsch', 'Nederlander'],
};

storiesOf('Core|Buttons/SiteLanguageChangeButton', module)
  .add('default', () => {
    return <SiteLanguageChangeButton {...props} />;
  })
  .add('customization', () => {
    const pullRight = boolean('pullRight', false);
    const minWidth = number('minWidth', 170);
    const textColor = color('textColor', 'rgba(255,255,255,1)');
    const backgroundColor = color('backgroundColor', 'rgba(105,105,105,1)');

    return (
      <SiteLanguageChangeButton
        {...props}
        pullRight={pullRight}
        minWidth={minWidth}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />
    );
  })
  .add('small variant (wip)', () => {
    const pullRight = boolean('pullRight', true);

    return (
      <div
        style={{
          marginLeft: 'calc(50% - 20px)',
        }}>
        <SiteLanguageChangeButton {...props} pullRight={pullRight} small />
      </div>
    );
  });
