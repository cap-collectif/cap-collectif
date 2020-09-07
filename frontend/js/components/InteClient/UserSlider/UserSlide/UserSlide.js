// @flow
import * as React from 'react';
import { Container, type Colors } from './UserSlide.style';

export type Props = {|
  name: string,
  job: string,
  img: string,
  colors: Colors,
|};

const UserSlide = ({ name, job, img, colors }: Props) => (
  <Container nameColor={colors.name}>
    <img src={img} alt="" />

    <div>
      <p className="name">{name}</p>
      <p className="job">{job}</p>
    </div>
  </Container>
);

export default UserSlide;
