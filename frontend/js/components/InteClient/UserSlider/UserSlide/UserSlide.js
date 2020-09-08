// @flow
import * as React from 'react';
import { Container, type Colors } from './UserSlide.style';

export type Props = {|
  name: string,
  job: { [string]: string },
  img: string,
  lang: string,
  colors: Colors,
|};

const UserSlide = ({ name, job, img, lang, colors }: Props) => (
  <Container nameColor={colors.name}>
    <img src={img} alt="" />

    <div>
      <p className="name">{name}</p>
      <p className="job">{job[lang]}</p>
    </div>
  </Container>
);

export default UserSlide;
