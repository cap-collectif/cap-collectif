/* eslint-env jest */
import React from 'react';
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
    expect(wrapper.find('div.idea__header')).toHaveLength(1);
    expect(wrapper.find('#idea-title')).toHaveLength(1);
    const title = wrapper.find('h1');
    expect(title).toHaveLength(1);
    expect(title.text()).toEqual(props.idea.title);
    expect(wrapper.find(UserAvatar)).toHaveLength(1);
    expect(wrapper.find(IdeaPageHeaderInfos)).toHaveLength(1);
  });

  it('it should render a div with provided class name', () => {
    const wrapper = shallow(<IdeaPageHeader {...props} className="css-class" {...IntlData} />);
    expect(wrapper.find('div.idea__header.css-class')).toHaveLength(1);
  });
});
