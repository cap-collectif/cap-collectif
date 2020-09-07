// @flow
import * as React from 'react';
import { Container } from './DebatePreviewList.style';
import DebatePreviewItem, {
  type Props as DebatePreviewItemProps,
} from '../DebatePreviewItem/DebatePreviewItem';

export type Props = {
  debates: Array<DebatePreviewItemProps>,
  style?: Object,
};

const DebatePreviewList = ({ debates, style }: Props) => (
  <Container style={style}>
    {debates.map((debate, idx) => (
      <DebatePreviewItem {...debate} key={`debate-preview-${idx}`} />
    ))}
  </Container>
);

export default DebatePreviewList;
