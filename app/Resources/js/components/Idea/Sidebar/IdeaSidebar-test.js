/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import IdeaSidebar from './IdeaSidebar';
import IdeaVoteBox from '../Vote/IdeaVoteBox';

const ideaContribuable = {
  canContribute: true
};

const ideaNotContribuable = {
  canContribute: false
};

const props = {
  onToggleExpand: () => {}
};

describe('<IdeaSidebar />', () => {
  it('should render nothing when idea is not contribuable', () => {
    const wrapper = shallow(<IdeaSidebar idea={ideaNotContribuable} expanded={false} {...props} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('should render the sidebar when idea is contribuable', () => {
    const wrapper = shallow(<IdeaSidebar idea={ideaContribuable} expanded={false} {...props} />);
    expect(wrapper.find('#sidebar')).toHaveLength(1);
    expect(wrapper.find('.sidebar-hideable')).toHaveLength(2);
    expect(wrapper.find(IdeaVoteBox)).toHaveLength(1);
    expect(wrapper.find('Button')).toHaveLength(1);
  });

  it('should render expanded class when required', () => {
    const wrapper = shallow(<IdeaSidebar idea={ideaContribuable} expanded {...props} />);
    expect(wrapper.find('.sidebar-hideable')).toHaveLength(2);
    expect(wrapper.find('.sidebar-hidden-small')).toHaveLength(0);
  });
});
