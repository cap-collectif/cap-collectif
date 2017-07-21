/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaPage } from './IdeaPage';

const contribuableIdea = {
  id: 1,
  canContribute: true,
};

const uncontribuableIdea = {
  id: 1,
  canContribute: false,
};

const idea = {
  id: 1,
};

describe('<IdeaPage />', () => {
  it('it should render the idea page with header, body, and votes and comments sections', () => {
    const wrapper = shallow(<IdeaPage idea={idea} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it should show the sidebar when idea is contribuable', () => {
    const wrapper = shallow(<IdeaPage idea={contribuableIdea} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it should not show the sidebar when idea is not contribuable', () => {
    const wrapper = shallow(<IdeaPage idea={uncontribuableIdea} />);
    expect(wrapper).toMatchSnapshot();
  });
});
