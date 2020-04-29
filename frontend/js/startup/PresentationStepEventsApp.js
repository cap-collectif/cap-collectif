// @flow
import React from 'react';
import Providers from './Providers';
import PresentationStepEvents, {
  type Props,
} from '../components/PresentationStep/PresentationStepEvents';

export default (props: Props) => (
  <Providers>
    <PresentationStepEvents {...props} />
  </Providers>
);
