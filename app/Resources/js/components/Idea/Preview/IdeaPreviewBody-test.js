/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPreviewBody from './IdeaPreviewBody';

const idea = {
  id: 1,
  trashed: false,
  title: 'Title',
  _links: {
    show: '',
  },
};

const ideaTrashed = {
  id: 1,
  title: 'Title',
  trashed: true,
  _links: {
    show: '',
  },
};

describe('<IdeaPreviewBody />', () => {
  it('it should render idea preview body', () => {
    const wrapper = shallow(<IdeaPreviewBody idea={idea} {...IntlData} />);
    expect(wrapper.find('.idea__preview__body')).to.have.length(1);
    expect(wrapper.find('h2.h4.idea__title.smart-fade')).to.have.length(1);
    expect(wrapper.find('.idea__label')).to.have.length(0);
    const link = wrapper.find('h2').find('a');
    expect(link.prop('href')).to.equal(idea._links.show);
    expect(link.text()).to.equal(idea.title);
  });

  it('should render trashed label when idea is trashed', () => {
    const wrapper = shallow(<IdeaPreviewBody idea={ideaTrashed} {...IntlData} />);
    expect(wrapper.find('.idea__label')).to.have.length(1);
  });
});
