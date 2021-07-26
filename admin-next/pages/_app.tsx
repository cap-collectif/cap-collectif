import { FC } from 'react';

// Import some css files for components
// TODO…

import type { AppProps } from 'next/app'
import moment from 'moment';
import Providers from '~/startup/Providers';
import appStore from '~/stores/AppStore';
import frMessages from '~/../../translations/fr-FR.json'
import enMessages from '~/../../translations/en-GB.json'
import esMessages from '~/../../translations/es-ES.json'
import nlMessages from '~/../../translations/nl-NL.json'
import deMessages from '~/../../translations/de-DE.json'
import svMessages from '~/../../translations/sv-SE.json'
import ocMessages from '~/../../translations/oc-OC.json'
import euMessages from '~/../../translations/eu-EU.json'

// TODO: this sould be dynamic
const locale = 'fr-FR';
moment.locale(locale);

const messages = {
  fr: frMessages,
  en: enMessages,
  es: esMessages,
  de: deMessages,
  nl: nlMessages,
  sv: svMessages,
  oc: ocMessages,
  eu: euMessages,
};

const intl = {
    locale,
    // TODO: this sould be dynamic
    messages: messages['fr'],
}

const SafeHydrate: FC<{}> = ({ children }) => {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' || typeof document === "undefined" ? null : children}
    </div>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <SafeHydrate>
    <Providers unstable__AdminNextstore={appStore({intl})}>
      <Component {...pageProps} />
    </Providers>
    </SafeHydrate>
  )
}
export default MyApp
