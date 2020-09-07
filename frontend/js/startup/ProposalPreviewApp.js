// @flow
import * as React from 'react';
import Providers from './Providers';
import ProposalPreviewList, {
  type Props,
} from '~/components/InteClient/ProposalPreview/ProposalPreviewList/ProposalPreviewList';

export default (props: Props) => (
  <Providers>
    <ProposalPreviewList {...props} />
  </Providers>
);
