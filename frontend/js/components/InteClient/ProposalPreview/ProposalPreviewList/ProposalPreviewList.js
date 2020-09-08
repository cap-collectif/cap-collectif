// @flow
import * as React from 'react';
import { Container } from './ProposalPreviewList.style';
import ProposalPreviewItem, {
  type Props as ProposalPreviewItemProps,
} from '../ProposalPreviewItem/ProposalPreviewItem';

export type Props = {
  proposals: Array<ProposalPreviewItemProps>,
  lang: string,
  style?: Object,
};

const ProposalPreviewList = ({ proposals, lang, style }: Props) => (
  <Container style={style}>
    {proposals.map((proposal, idx) => (
      <ProposalPreviewItem {...proposal} key={`proposal-preview-${idx}`} lang={lang} />
    ))}
  </Container>
);

export default ProposalPreviewList;
