/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import FooterAbout from './FooterAbout'

describe('<FooterAbout />', () => {
  it('renders correcty', () => {
    const props = {
      textBody: "Ce site est fait par CapCo. C'est fou hein ?",
      textTitle: 'À propos',
      socialNetworks: [],
      titleColor: '#000',
      textColor: '#000',
      backgroundColor: '#FFF',
    }
    const wrapper = shallow(<FooterAbout {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correcty and displays social networks', () => {
    const props = {
      textBody: "Ce site est fait par CapCo. C'est fou hein ?",
      textTitle: 'À propos',
      socialNetworks: [
        {
          link: 'fb.com',
          media: 'fb.jpg',
          title: 'Facebook',
          style: 'facebook',
        },
        {
          link: 'x.com',
          media: 'cuicui.jpg',
          title: 'X',
          style: 'x',
        },
      ],
      titleColor: '#000',
      textColor: '#000',
      backgroundColor: '#FFF',
    }
    const wrapper = shallow(<FooterAbout {...props} />)
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('FooterAbout__SocialNetworks')).toHaveLength(1)
  })
})
