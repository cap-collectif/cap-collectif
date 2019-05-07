// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ContactAdminForm } from './ContactAdminForm';
import { formMock } from '../../../mocks';

describe('<ContactAdminForm />', () => {
  const props = {
    ...formMock,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ContactAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
