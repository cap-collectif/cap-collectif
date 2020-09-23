// @flow
/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import ChangeLanguageOnWebsiteHeader, { Content } from './ChangeLanguageOnWebsiteHeader';

describe('<ChangeLanguageOnWebsiteHeader />', () => {
  const props = {
    onChange: jest.fn(),
    onClose: jest.fn(),
    defaultLanguage: 'en-GB',
    localeChoiceTranslations: [
      {
        code: 'de-DE',
        message: 'Möchten Sie die Seite in Ihrer Sprache anzeigen?',
        label: 'Weiter',
      },
      {
        code: 'en-GB',
        message: 'Do you want to consult the website in your language?',
        label: 'Continue',
      },
      {
        code: 'fr-FR',
        message: 'Voulez-vous consulter le site dans votre langue ?',
        label: 'Continuer',
      },
    ],
    languageList: [
      { translationKey: 'french', code: 'fr-FR' },
      { translationKey: 'english', code: 'en-GB' },
      { translationKey: 'spanish', code: 'sp-SP' },
      { translationKey: 'deutsch', code: 'de-DE' },
    ],
  };
  it('should render correctly', () => {
    const wrapper = mount(
      <IntlProvider>
        <ChangeLanguageOnWebsiteHeader {...props} />
      </IntlProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should return null with a wrong defaultLanguage', () => {
    const wrapper = mount(<ChangeLanguageOnWebsiteHeader {...props} defaultLanguage="Dothraki" />);
    expect(wrapper).toMatchSnapshot();
    // $FlowFixMe enzyme and styled-components have a type conflict
    expect(wrapper.contains(Content)).toBe(false);
  });
});
