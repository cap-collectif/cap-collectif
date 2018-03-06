// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationSortableQuestion } from './RegistrationSortableQuestion';

describe('<RegistrationSortableQuestion />', () => {
  const props = {
    value: { type: 'select' },
    isSuperAdmin: true,
    deleteField: jest.fn(),
    updateField: jest.fn()
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationSortableQuestion {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when not a superAdmin', () => {
    const wrapper = shallow(<RegistrationSortableQuestion {...props} isSuperAdmin={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
