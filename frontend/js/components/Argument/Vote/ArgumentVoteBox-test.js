// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentVoteBox } from './ArgumentVoteBox';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ArgumentVoteBox />', () => {
  it('renders correctly', () => {
    const argument = {
      $refType,
      $fragmentRefs,
      votes: {
        totalCount: 5,
      },
    };
    const wrapper = shallow(<ArgumentVoteBox argument={argument} />);
    expect(wrapper).toMatchSnapshot();
  });
});
