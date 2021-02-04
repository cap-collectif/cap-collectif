// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectHeaderCounter } from './ProjectHeaderCounter';

describe('<ProjectHeaderCounter />', () => {
  const props = {
    contributionsCount: 10,
    project: {
      opinionsCount: 0,
      versionsCount: 0,
      argumentsCount: 0,
      sourcesCount: 0,
      repliesCount: 0
    }
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectHeaderCounter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
