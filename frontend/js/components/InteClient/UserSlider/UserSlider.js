// @flow
import * as React from 'react';
import { Container } from './UserSlider.style';
import UserSlide, { type Props as UserSlideProps } from './UserSlide/UserSlide';

export type Props = {
  users: Array<UserSlideProps>,
  style?: Object,
};

const UserSlider = ({ users, style }: Props) => (
  <Container style={style}>
    {users.map((user, idx) => (
      <UserSlide {...user} key={`user-slide-${idx}`} />
    ))}
  </Container>
);

export default UserSlider;
