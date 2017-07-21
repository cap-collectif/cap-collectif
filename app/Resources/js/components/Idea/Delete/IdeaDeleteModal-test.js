/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IdeaDeleteModal from './IdeaDeleteModal';

const props = {
  idea: {
    title: 'title',
  },
  show: true,
  onToggleModal: jest.fn(),
};

describe('<IdeaDeleteModal />', () => {
  it('should render a modal', () => {
    const wrapper = shallow(<IdeaDeleteModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
