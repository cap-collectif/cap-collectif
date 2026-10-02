/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { BodyInfos } from './BodyInfos'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<BodyInfos />', () => {
  it('should render correcty', () => {
    const wrapper = shallow(<BodyInfos body="coucou" />)
    expect(wrapper).toMatchSnapshot()
  })
})
