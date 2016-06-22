/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.children()).to.have.length(0);
  });

  it('it should render a row containing as many idea list item as ideas in props', () => {
    const wrapper = shallow(<IdeasList ideas={ideas} {...IntlData} />);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find(IdeaListItem)).to.have.length(2);
  });
});
