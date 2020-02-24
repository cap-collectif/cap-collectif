// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import Approve from './Approve';

describe('<Approve />', () => {
  const props = {
    input: {
      onChange: jest.fn(),
      value: 'VALIDEY',
    },
    approvedValue: 'VALIDEY',
    refusedValue: 'REFUSEY',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<Approve {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
