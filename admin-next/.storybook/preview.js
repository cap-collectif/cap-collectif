import { CapUIProvider } from '@cap-collectif/ui';
import GlobalCSS from '../styles/GlobalCSS';
import Fonts from '../styles/Fonts';
import { setIntlConfig, withIntl } from 'storybook-addon-intl';
import frMessages from '../../translations/fr-FR.json';
import enMessages from '../../translations/en-GB.json';

export const messages = {
  'fr-FR': frMessages,
  'en-GB': enMessages,
};

/* # Intl config # */
const getMessages = locale => messages[locale];
setIntlConfig({
  locales: ['fr-FR', 'en-GB'],
  defaultLocale: 'fr-FR',
  getMessages,
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  withIntl,
  Story => (
    <CapUIProvider>
      <GlobalCSS />
      <Fonts />
      <Story />
    </CapUIProvider>
  ),
];
