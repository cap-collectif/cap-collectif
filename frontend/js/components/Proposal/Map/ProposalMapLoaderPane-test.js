// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalMapLoaderPane from './ProposalMapLoaderPane';

describe('<ProposalMapLoaderPane />', () => {
  const props = { hasError: false, retry: jest.fn() };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalMapLoaderPane {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    const wrapper = shallow(<ProposalMapLoaderPane {...props} hasError />);
    expect(wrapper).toMatchSnapshot();
  });
});
