// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import Select from './Select';

describe('<Select />', () => {
  const props = {
    label: 'label',
  };

  it('should render', () => {
    const wrapper = shallow(<Select {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
