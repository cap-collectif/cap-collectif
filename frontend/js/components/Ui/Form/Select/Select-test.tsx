/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import Select from './Select'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Select />', () => {
  const props = {
    label: 'label',
  }
  it('should render', () => {
    const wrapper = shallow(<Select {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
