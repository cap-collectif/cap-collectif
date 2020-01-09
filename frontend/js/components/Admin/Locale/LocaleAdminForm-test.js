// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LocaleAdminForm } from './LocaleAdminForm';
import { formMock, $refType, $fragmentRefs } from '../../../mocks';

describe('<ProjectCreateButton />', () => {
  const defaultLocales = [
    {
      $fragmentRefs,
      id: 'fr-FR',
      isEnabled: true,
    },
    {
      $fragmentRefs,
      id: 'en-EN',
      isEnabled: false,
    },
  ];

  const defaultProps = {
    ...formMock,
    query: {
      ...$refType,
      availableLocales: [],
    },
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly', () => {
    const props = {
      ...defaultProps,
      query: {
        ...$refType,
        availableLocales: defaultLocales,
      },
    };
    const wrapper = shallow(<LocaleAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
