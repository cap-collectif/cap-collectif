/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeaPageButtons } from './IdeaPageButtons';

const props = {
  dispatch: jest.fn(),
  idea: {
    title: 'Title',
    author: {},
    canContribute: false,
    _links: {
      show: '',
    },
  },
};

describe('<IdeaPageButtons />', () => {
  it('it should render all idea buttons and modals', () => {
    const wrapper = shallow(<IdeaPageButtons {...props} {...IntlData} />);
    expect(wrapper).toMatchSnapshot();
  });
});
