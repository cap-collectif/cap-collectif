// @flow
import * as React from 'react';
import { Container } from './DebatePreviewItem.style';

export type Props = {|
  title: string,
  img: string,
|};

const DebatePreviewItem = ({ title, img }: Props) => (
  <Container>
    <img src={img} alt="" />
    <p>{title}</p>
  </Container>
);

export default DebatePreviewItem;
