// @flow
import * as React from 'react';
import { Container, Header, Footer, type Colors } from './ProposalPreviewItem.style';

export type Props = {|
  content: {
    [string]: string,
  },
  author: string,
  job: {
    [string]: string,
  },
  img: string,
  buttonLabel: {
    [string]: string,
  },
  link: { [string]: string },
  lang: string,
  colors: Colors,
|};

const ProposalPreviewItem = ({
  content,
  author,
  job,
  img,
  buttonLabel,
  colors,
  link,
  lang,
}: Props) => (
  <Container href={link[lang]}>
    <Header btnColor={colors.button}>
      <div className="avatar-wrapper">
        <img src={img} alt="" />
      </div>
      <a href={link[lang]}>{buttonLabel[lang]}</a>
    </Header>

    <p className="proposal-content">{content[lang]}</p>

    <Footer authorColor={colors.name}>
      <p className="author">{author}</p>
      <p className="job">{job[lang]}</p>
    </Footer>
  </Container>
);

export default ProposalPreviewItem;
