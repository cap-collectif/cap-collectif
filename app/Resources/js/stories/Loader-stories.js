// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Loader from '../components/Ui/Loader';

storiesOf('Loader', module).add('Default', () => {
  return (
    <div className="ml-30 mr-30 storybook-container">
      <h1>
        Loader {' '}
        <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Loader-stories.js">
          <i className="small cap cap-setting-gear-1"/>
        </a>
      </h1>
      <hr/>
      <Loader />
    </div>
  );
});
