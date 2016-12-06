/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
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
    const wrapper = shallow(<IdeaPreview idea={idea} {...IntlData} />);
    expect(wrapper.find('.idea__preview')).to.have.length(1);
    expect(wrapper.find('.idea__preview.bg-vip')).to.have.length(0);
    expect(wrapper.find(IdeaPreviewHeader)).to.have.length(1);
    expect(wrapper.find(IdeaPreviewBody)).to.have.length(1);
    expect(wrapper.find(IdeaPreviewFooter)).to.have.length(1);
  });

  it('should render vip background when idea author is vip', () => {
    const wrapper = shallow(<IdeaPreview idea={ideaVip} {...IntlData} />);
    expect(wrapper.find('.idea__preview.bg-vip')).to.have.length(1);
  });
});
