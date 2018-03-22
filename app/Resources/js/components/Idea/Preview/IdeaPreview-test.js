/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import IdeaPreview from './IdeaPreview';

const idea = {
  id: 1,
  author: {},
};

const ideaVip = {
  id: 1,
  author: {
    vip: true,
  },
};

describe('<IdeaPreview />', () => {
  it('it should render idea preview', () => {
    const wrapper = shallow(<IdeaPreview idea={idea} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render vip background when idea author is vip', () => {
    const wrapper = shallow(<IdeaPreview idea={ideaVip} />);
    expect(wrapper).toMatchSnapshot();
  });
});
