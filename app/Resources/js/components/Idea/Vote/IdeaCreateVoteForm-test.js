// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { IdeaCreateVoteForm } from './IdeaCreateVoteForm';

// eslint-disable-next-line react/prop-types
const props = {
  dispatch: jest.fn(),
  idea: {},
  isSubmitting: false,
  anonymous: false,
};

describe('<IdeaCreateVoteForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<IdeaCreateVoteForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
