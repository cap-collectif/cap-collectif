// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ChangeLanguageOnWebsiteHeader from './ChangeLanguageOnWebsiteHeader';

describe('<ChangeLanguageOnWebsiteHeader />', () => {
  const props = {
    onChange: jest.fn(),
    onClose: jest.fn(),
    defaultLanguage: 'Français',
    languageList: ['Français', 'English', 'Español', 'Deutsch', 'Nederlander'],
  };
  it('should render correctly', () => {
    const wrapper = shallow(<ChangeLanguageOnWebsiteHeader {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should return null with a wrong defaultLanguage', () => {
    const wrapper = shallow(
      <ChangeLanguageOnWebsiteHeader {...props} defaultLanguage="Dothraki" />,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.type()).toEqual(null);
  });
});
