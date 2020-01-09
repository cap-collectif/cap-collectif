// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LocaleAdminModalList } from './LocaleAdminModalList';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<LocaleAdminModalList />', () => {
  const defautlLocales = [
    {
      $refType,
      $fragmentRefs,
      id: 'fr-FR',
    },
    {
      $refType,
      $fragmentRefs,
      id: 'en-EN',
    },
  ];

  const defaultProps = {
    locales: defautlLocales,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<LocaleAdminModalList {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly empty', () => {
    const props = {
      locales: [],
    };
    const wrapper = shallow(<LocaleAdminModalList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
