// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionPage } from './OpinionPage';

describe('<OpinionPage />', () => {
  const props = {
    opinionId: 'opinion1',
    versionId: null,
    fetchOpinionVotes: jest.fn()
  };

  it('should render correctly', () => {
    const wrapper = shallow(<OpinionPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
