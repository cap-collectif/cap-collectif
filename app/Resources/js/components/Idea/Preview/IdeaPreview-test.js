/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import IdeaPreview from './IdeaPreview';
import IdeaPreviewHeader from './IdeaPreviewHeader';
import IdeaPreviewBody from './IdeaPreviewBody';
import IdeaPreviewFooter from './IdeaPreviewFooter';

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
    expect(wrapper.find('.idea__preview')).toHaveLength(1);
    expect(wrapper.find('.idea__preview.bg-vip')).toHaveLength(0);
    expect(wrapper.find(IdeaPreviewHeader)).toHaveLength(1);
    expect(wrapper.find(IdeaPreviewBody)).toHaveLength(1);
    expect(wrapper.find(IdeaPreviewFooter)).toHaveLength(1);
  });

  it('should render vip background when idea author is vip', () => {
    const wrapper = shallow(<IdeaPreview idea={ideaVip} />);
    expect(wrapper.find('.idea__preview.bg-vip')).toHaveLength(1);
  });
});
