// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationAdminPage } from './RegistrationAdminPage';
import IntlData from '../../translations/FR';

describe('<RegistrationAdminPage />', () => {
  const props = {
    ...IntlData,
    features: {},
    onToggle: jest.fn(),
    addNewField: jest.fn(),
    deleteField: jest.fn(),
    dynamicFields: [],
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
