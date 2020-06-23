// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { LanguageButton } from './LanguageButton';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<LanguageButton />', () => {
  const props = {
    onChange: jest.fn(),
    defaultLanguage: 'Français',
    languages: [
      { $refType, $fragmentRefs, id: 'fr-FR', code: 'FR_FR' },
      { $refType, $fragmentRefs, id: 'en-GB', code: 'EN_GB' },
      { $refType, $fragmentRefs, id: 'es-ES', code: 'ES_ES' },
      { $refType, $fragmentRefs, id: 'de-DE', code: 'DE_DE' },
      { $refType, $fragmentRefs, id: 'nl-NL', code: 'NL_NL' },
      { $refType, $fragmentRefs, id: 'sv-SE', code: 'SV_SE' },
      { $refType, $fragmentRefs, id: 'oc-OC', code: 'OC_OC' },
      { $refType, $fragmentRefs, id: 'eu-EU', code: 'EU_EU' },
    ],
  };
  it('should render correctly', () => {
    const wrapper = shallow(<LanguageButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should return null with a wrong defaultLanguage', () => {
    const wrapper = shallow(<LanguageButton {...props} defaultLanguage="Dothraki" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.type()).toEqual(null);
  });
});
