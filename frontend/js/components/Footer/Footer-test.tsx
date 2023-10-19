/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { Footer } from './Footer'
import { features } from '../../redux/modules/default'

describe('<Footer />', () => {
  it('renders correcty', () => {
    const props = {
      textBody: "Ce site est fait par CapCo. C'est fou hein ?",
      textTitle: 'À propos',
      socialNetworks: [],
      links: [],
      legals: {
        cookies: true,
        legal: true,
        privacy: true,
      },
      cookiesText: "Quand je suis stressé je range les cookies dans une boite c'est comme ça",
      titleColor: '#000',
      textColor: '#000',
      backgroundColor: '#FFF',
      linksBackgroundColor: '#000',
      linksTextColor: '#00F',
      cookiesPath: '/cookies',
      privacyPath: '/privacy',
      legalPath: '/legals',
      features,
      currentRouteParams: {
        _locale: 'fr-FR',
      },
      currentRouteName: 'app_homepage',
      defaultLocale: 'en-GB',
      languageList: [
        {
          translationKey: 'french',
          code: 'fr-FR',
        },
        {
          translationKey: 'english',
          code: 'en-GB',
        },
      ],
    }
    const wrapper = shallow(<Footer {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
