/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IdeaPreviewHeader from './IdeaPreviewHeader';

const idea = {
  id: 1,
  author: {},
  createdAt: '2018-03-09T15:05:34.372Z',
};

describe('<IdeaPreviewHeader />', () => {
  it('should render idea preview header', () => {
    const wrapper = shallow(<IdeaPreviewHeader idea={idea} />);
    expect(wrapper).toMatchSnapshot();
  });
});
