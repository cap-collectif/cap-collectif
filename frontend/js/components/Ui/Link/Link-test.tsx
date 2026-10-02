/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { Link } from './Link'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Link />', () => {
  const props = {
    url: '/url.url',
  }
  it('renders correctly', () => {
    const wrapper = shallow(<Link {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
