// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, number, color } from 'storybook-addon-knobs';

import SiteLanguageChangeButton from '../../../components/Ui/Button/SiteLanguageChangeButton';

const props = {
  onChange: () => {},
  defaultLanguage: 'fr-FR',
  languageList: [
    { translationKey: 'french', code: 'fr-FR' },
    { translationKey: 'english', code: 'en-GB' },
    { translationKey: 'deutsch', code: 'de-DE' },
  ],
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
    const dropup = boolean('dropup', false);

    return (
      <SiteLanguageChangeButton
        {...props}
        pullRight={pullRight}
        dropup={dropup}
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
