// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Section from '../components/Ui/BackOffice/Section';




storiesOf('Back office|Section', module)
  .add('default case', () => {
    
    return  <Section/>;
  });