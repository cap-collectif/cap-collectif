/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { LocaleAdminSelect } from './LocaleAdminSelect'
import { $refType } from '~/mocks'

describe('<LocaleAdminSelect />', () => {
  const defaultProps = {
    formName: 'form',
    locales: [
      {
        ' $refType': $refType,
        id: 'fr-FR',
        traductionKey: 'Français',
      },
      {
        ' $refType': $refType,
        id: 'en-EN',
        traductionKey: 'English',
      },
    ],
    currentValues: {
      'fr-FR': {
        id: 'fr-FR',
        isEnabled: true,
        isPublished: true,
      },
      'en-EN': {
        id: 'en-EN',
        isEnabled: false,
        isPublished: false,
      },
    },
  }
  it('renders correctly', () => {
    const wrapper = shallow(<LocaleAdminSelect {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly empty', () => {
    const props = {
      locales: [],
      currentValues: {},
      formName: 'form',
    }
    const wrapper = shallow(<LocaleAdminSelect {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
