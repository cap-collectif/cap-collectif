// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminProgressSteps } from './ProposalAdminProgressSteps';

describe('<ProposalAdminProgressSteps />', () => {
  const props = {
    dispatch: () => {},
    fields: { length: 0, map: () => [], remove: jest.fn() },
    progressSteps: [],
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminProgressSteps {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
