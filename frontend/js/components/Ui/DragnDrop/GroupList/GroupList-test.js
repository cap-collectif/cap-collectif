/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import GroupList from './GroupList';

describe('<GroupList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<GroupList onDragEnd={() => {}}>Bonjour</GroupList>);
    expect(wrapper).toMatchSnapshot();
  });
});
