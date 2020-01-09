// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LocaleAdminModal } from './LocaleAdminModal';
import { formMock, $refType, $fragmentRefs } from '~/mocks';

describe('<LocaleAdminModal />', () => {
  const defautlLocales = [
    {
      $fragmentRefs,
      $refType,
      id: 'fr-FR',
      isEnabled: true,
    },
    {
      $fragmentRefs,
      $refType,
      id: 'en-EN',
      isEnabled: false,
    },
  ];

  const defaultProps = {
    ...formMock,
    displayModal: jest.fn(),
    show: true,
    locales: [],
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly', () => {
    const props = {
      ...defaultProps,
      locales: defautlLocales,
    };
    const wrapper = shallow(<LocaleAdminModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
