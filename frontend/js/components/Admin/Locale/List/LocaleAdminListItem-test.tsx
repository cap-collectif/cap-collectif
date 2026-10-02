/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { LocaleAdminListItem } from './LocaleAdminListItem'
import { $refType } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
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
