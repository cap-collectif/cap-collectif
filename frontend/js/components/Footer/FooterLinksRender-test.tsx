/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import FooterLinksRender from './FooterLinksRender'
// TODO : write a test for the multilangue button when props are ready #9440
describe('<FooterLinksRender />', () => {
  it('renders correcty', () => {
    const props = {
      links: [
        {
          name: 'FAQ',
          url: '/faq',
        },
        {
          name: 'Développeurs',
          url: '/devs',
        },
      ],
      legals: {
        cookies: true,
        legal: true,
        privacy: true,
      },
      cookiesText: "Quand je suis stressé je range les cookies dans une boite c'est comme ça",
      cookiesPath: '/cookies',
      privacyPath: '/privacy',
      legalPath: '/legals',
    }
    const wrapper = shallow(<FooterLinksRender {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
