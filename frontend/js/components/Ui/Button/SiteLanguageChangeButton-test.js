// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import SiteLanguageChangeButton from './SiteLanguageChangeButton';

describe('<SiteLanguageChangeButton />', () => {
  const props = {
    onChange: jest.fn(),
    defaultLanguage: 'fr-FR',
    languageList: [
      { translationKey: 'french', code: 'fr-FR' },
      { translationKey: 'english', code: 'en-GB' },
      { translationKey: 'deutsch', code: 'de-DE' },
    ],
  };
  it('should render correctly', () => {
    const wrapper = shallow(<SiteLanguageChangeButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should return null with a wrong defaultLanguage', () => {
    const wrapper = shallow(<SiteLanguageChangeButton {...props} defaultLanguage="Dothraki" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.type()).toEqual(null);
  });
});
