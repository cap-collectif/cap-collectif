/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

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
    const wrapper = shallow(<IdeaPreviewBody idea={idea} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render trashed label when idea is trashed', () => {
    const wrapper = shallow(<IdeaPreviewBody idea={ideaTrashed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
