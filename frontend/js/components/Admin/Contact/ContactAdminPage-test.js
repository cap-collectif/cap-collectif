// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ContactAdminPage } from './ContactAdminPage';
import { formMock, $refType } from '../../../mocks';

describe('<ContactAdminForm />', () => {
  const props = {
    ...formMock,
    query: {
      $refType,
      siteImage: {
        id: 'image1',
        media: {
          id: 'IDimage1',
          name: 'image1.jpg',
          url: 'capco/image1.jpg',
        },
      },
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ContactAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
