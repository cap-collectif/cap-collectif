// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ContactAdminPage } from './ContactAdminPage';
import { formMock } from '../../../mocks';

describe('<ContactAdminForm />', () => {
  const props = {
    ...formMock,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ContactAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
