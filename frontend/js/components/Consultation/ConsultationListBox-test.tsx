/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ConsultationListBox } from './ConsultationListBox'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ConsultationListBox />', () => {
  const props = {
    id: 'cstep1',
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ConsultationListBox {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
