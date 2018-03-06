// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaDeleteVoteForm } from './IdeaDeleteVoteForm';

const props = {
  dispatch: jest.fn(),
  idea: {},
  anonymous: false
};

describe('<IdeaDeleteVoteForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<IdeaDeleteVoteForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
