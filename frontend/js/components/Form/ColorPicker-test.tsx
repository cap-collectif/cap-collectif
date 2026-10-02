/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import ColorPicker from './ColorPicker'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ColorPicker />', () => {
  it('renders correcty', () => {
    const props = {
      input: {
        value: '#DDAADD',
        onChange: () => {},
      },
    }
    const wrapper = shallow(<ColorPicker {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
