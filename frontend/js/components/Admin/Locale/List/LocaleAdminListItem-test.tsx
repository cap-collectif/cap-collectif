/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { LocaleAdminListItem } from './LocaleAdminListItem'
import { $refType } from '~/mocks'

describe('<LocaleAdminListItem />', () => {
  const defaultProps = {
    locale: {
      ' $refType': $refType,
      code: 'FR_FR',
      id: 'locale',
      isDefault: true,
      isEnabled: true,
      isPublished: true,
      traductionKey: 'locale',
    },
  }
  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminListItem {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
