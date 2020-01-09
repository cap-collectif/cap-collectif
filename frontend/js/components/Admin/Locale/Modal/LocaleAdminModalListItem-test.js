// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LocaleAdminModalListItem } from './LocaleAdminModalListItem';
import { $refType } from '~/mocks';

describe('<LocaleAdminModalListItem />', () => {
  const defaultLocale = {
    $refType,
    id: 'en-EN',
    isDefault: true,
    isEnabled: true,
    traductionKey: 'Onglish',
  };

  const defaultProps = {
    locale: {
      ...defaultLocale,
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<LocaleAdminModalListItem {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when not default', () => {
    const props = {
      ...defaultProps,
      locale: {
        ...defaultLocale,
        isDefault: false,
      },
    };

    const wrapper = shallow(<LocaleAdminModalListItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when disabled', () => {
    const props = {
      ...defaultProps,
      locale: {
        ...defaultLocale,
        isEnabled: false,
      },
    };

    const wrapper = shallow(<LocaleAdminModalListItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
