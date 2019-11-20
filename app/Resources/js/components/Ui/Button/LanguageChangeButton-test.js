// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import LanguageChangeButton from './LanguageChangeButton';

describe('<LanguageChangeButton />', () => {
  it('should render correctly', () => {
    const props = {
      onChange: jest.fn(),
      defaultLanguage: 'Français',
      languageList: [
        { language: 'Français', translated: false },
        { language: 'English', translated: false },
        { language: 'Español', translated: true },
        { language: 'Deutsch', translated: true },
        { language: 'Nederlander', translated: true },
      ],
    };
    const wrapper = shallow(<LanguageChangeButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
