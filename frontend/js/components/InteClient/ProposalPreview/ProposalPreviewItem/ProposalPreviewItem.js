// @flow
import * as React from 'react';
import { Container, Header, Footer, type Colors } from './ProposalPreviewItem.style';

export type Props = {|
  content: string,
  author: string,
  job: string,
  img: string,
  buttonLabel: string,
  link: string,
  colors: Colors,
|};

const ProposalPreviewItem = ({ content, author, job, img, buttonLabel, colors, link }: Props) => (
  <Container>
    <Header btnColor={colors.button}>
      <img src={img} alt="avatar" />
      <a href={link}>{buttonLabel}</a>
    </Header>

    <p className="proposal-content">{content}</p>

    <Footer authorColor={colors.name}>
      <p className="author">{author}</p>
      <p className="job">{job}</p>
    </Footer>
  </Container>
);

export default ProposalPreviewItem;
