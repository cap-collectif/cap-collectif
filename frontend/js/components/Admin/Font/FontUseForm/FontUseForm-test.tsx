/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { FontUseForm } from './FontUseForm'
import { $refType, intlMock } from '~/mocks'

const font = {
  ' $refType': $refType,
  id: '1',
  name: 'Comic Sans MS',
  useAsHeading: false,
  useAsBody: false,
  isCustom: false,
}
const props = {
  intl: intlMock,
  fontLoading: null,
  fonts: [
    { ...font },
    { ...font, id: '2' },
    { ...font, id: '3', useAsHeading: true, useAsBody: true },
    { ...font, id: '4', isCustom: true },
  ],
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<FontAdminContent />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontUseForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
