// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SSOByPassAuthForm } from './SSOByPassAuthForm';
import { features } from '../../../redux/modules/default';

describe('<SSOByPassAuthForm />', () => {
  const props = {
    features: {
      ...features,
    },
    onToggle: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<SSOByPassAuthForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
