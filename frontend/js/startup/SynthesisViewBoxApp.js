// @flow
import React from 'react';
import Providers from './Providers';
import SynthesisBox from '../components/Synthesis/SynthesisBox';

export default (props: Props) => (
  <Providers>
    <SynthesisBox {...props} />
  </Providers>
);
