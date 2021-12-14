import { CapUIProvider } from '@cap-collectif/ui';
import GlobalCSS from '../styles/GlobalCSS';
import Fonts from '../styles/Fonts';

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
  Story => (
    <CapUIProvider>
      <GlobalCSS />
      <Fonts />
      <Story />
    </CapUIProvider>
  ),
];
