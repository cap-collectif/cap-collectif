/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { DraftBox } from './DraftBox'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DraftBox />', () => {
  const props = {}
  it('renders draft box', () => {
    const wrapper = shallow(
      <DraftBox {...props}>
        <div className="foo" />
      </DraftBox>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
