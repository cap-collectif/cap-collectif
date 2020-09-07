// @flow
import * as React from 'react';
import Providers from './Providers';
import DebatePreviewList, {
  type Props,
} from '~/components/InteClient/DebatePreview/DebatePreviewList/DebatePreviewList';

export default (props: Props) => (
  <Providers>
    <DebatePreviewList {...props} />
  </Providers>
);
