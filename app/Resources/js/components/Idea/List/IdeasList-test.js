/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeasList from './IdeasList';
import IdeaListItem from './IdeaListItem';

const ideas = [
  { id: 1 },
  { id: 2 },
];

describe('<IdeasList />', () => {
  it('it should render nothing when no ideas', () => {
    const wrapper = shallow(<IdeasList ideas={[]} {...IntlData} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('it should render a row containing as many idea list item as ideas in props', () => {
    const wrapper = shallow(<IdeasList ideas={ideas} {...IntlData} />);
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find(IdeaListItem)).toHaveLength(2);
  });
});
