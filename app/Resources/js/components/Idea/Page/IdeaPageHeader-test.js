/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPageHeader from './IdeaPageHeader';
import IdeaPageHeaderInfos from './IdeaPageHeaderInfos';
import UserAvatar from '../../User/UserAvatar';

const props = {
  idea: {
    id: 1,
    title: 'Title',
  },
};

describe('<IdeaPageHeader />', () => {
  it('it should render a title, a user avatar and idea infos', () => {
    const wrapper = shallow(<IdeaPageHeader {...props} {...IntlData} />);
    expect(wrapper.find('div.idea__header')).to.have.length(1);
    expect(wrapper.find('#idea-title')).to.have.length(1);
    const title = wrapper.find('h1');
    expect(title).to.have.length(1);
    expect(title.text()).to.equal(props.idea.title);
    expect(wrapper.find(UserAvatar)).to.have.length(1);
    expect(wrapper.find(IdeaPageHeaderInfos)).to.have.length(1);
  });

  it('it should render a div with provided class name', () => {
    const wrapper = shallow(<IdeaPageHeader {...props} className="css-class" {...IntlData} />);
    expect(wrapper.find('div.idea__header.css-class')).to.have.length(1);
  });
});
