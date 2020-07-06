/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Participant } from './Participant';
import { $refType, $fragmentRefs } from '~/mocks';

const participant = {
  $fragmentRefs,
  $refType,
  username: 'Username test',
};

describe('<Participant />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Participant participant={participant} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when registeredAnonymously', () => {
    const wrapper = shallow(<Participant participant={participant} isAnonymous />);
    expect(wrapper).toMatchSnapshot();
  });
});
