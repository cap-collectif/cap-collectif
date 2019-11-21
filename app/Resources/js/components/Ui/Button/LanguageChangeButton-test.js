// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import LanguageChangeButton from './LanguageChangeButton';

describe('<LanguageChangeButton />', () => {
  const props = {
    onChange: jest.fn(),
    defaultLanguage: 'Français',
    languageList: [
      { name: 'Français', translated: false },
      { name: 'English', translated: false },
      { name: 'Español', translated: true },
      { name: 'Deutsch', translated: true },
      { name: 'Nederlander', translated: true },
    ],
  };
  it('should render correctly', () => {
    const wrapper = shallow(<LanguageChangeButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should return null with a wrong defaultLanguage', () => {
    const wrapper = shallow(<LanguageChangeButton {...props} defaultLanguage="Dothraki" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.type()).toEqual(null);
  });
});
