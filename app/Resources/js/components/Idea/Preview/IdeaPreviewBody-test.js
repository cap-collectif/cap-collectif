/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import IdeaPreviewBody from './IdeaPreviewBody';

const idea = {
  id: 1,
  trashed: false,
  title: 'Title',
  _links: {
    show: ''
  }
};

const ideaTrashed = {
  id: 1,
  title: 'Title',
  trashed: true,
  _links: {
    show: ''
  }
};

describe('<IdeaPreviewBody />', () => {
  it('it should render idea preview body', () => {
    const wrapper = shallow(<IdeaPreviewBody idea={idea} />);
    expect(wrapper.find('.idea__preview__body')).toHaveLength(1);
    expect(wrapper.find('h2.h4.idea__title.smart-fade')).toHaveLength(1);
    expect(wrapper.find('.idea__label')).toHaveLength(0);
    const link = wrapper.find('h2').find('a');
    expect(link.prop('href')).toEqual(idea._links.show);
    expect(link.text()).toEqual(idea.title);
  });

  it('should render trashed label when idea is trashed', () => {
    const wrapper = shallow(<IdeaPreviewBody idea={ideaTrashed} />);
    expect(wrapper.find('.idea__label')).toHaveLength(1);
  });
});
