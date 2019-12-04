// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectTrashButton } from './ProjectTrashButton';

describe('<ProjectTrashButton />', () => {
  const props = {
    user: {},
    link: 'www.test.com',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrashButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
