// @flow
import * as React from 'react';
import { Container } from './ProposalPreviewList.style';
import ProposalPreviewItem, {
  type Props as ProposalPreviewItemProps,
} from '../ProposalPreviewItem/ProposalPreviewItem';

export type Props = {
  proposals: Array<ProposalPreviewItemProps>,
  style?: Object,
};

const ProposalPreviewList = ({ proposals, style }: Props) => (
  <Container style={style}>
    {proposals.map((proposal, idx) => (
      <ProposalPreviewItem {...proposal} key={`proposal-preview-${idx}`} />
    ))}
  </Container>
);

export default ProposalPreviewList;
