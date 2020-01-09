// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LocaleAdminList } from './LocaleAdminList';
import { $fragmentRefs, $refType } from '~/mocks';

describe('<LocaleAdminList />', () => {
  const defaultProps = {
    locales: [{ $refType, $fragmentRefs, isPublished: true, isEnabled: true }],
  };

  it('renders correctly empty', () => {
    const props = {
      locales: [],
    };

    const wrapper = shallow(<LocaleAdminList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<LocaleAdminList {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
