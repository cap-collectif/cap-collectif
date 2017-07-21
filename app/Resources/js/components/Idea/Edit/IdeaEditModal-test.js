/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { IdeaEditModal } from './IdeaEditModal';

const props = {
  idea: {},
  themes: [],
  show: true,
  submitting: false,
  dispatch: jest.fn(),
};

describe('<IdeaEditModal />', () => {
  it('should render a modal with an idea form', () => {
    const wrapper = shallow(<IdeaEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
