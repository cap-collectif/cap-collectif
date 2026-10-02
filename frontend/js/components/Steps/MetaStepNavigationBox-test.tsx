/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { MetaStepNavigationBox } from './MetaStepNavigationBox'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<MetaStepNavigationBox />', () => {
  it('should render correctly', () => {
    const props = {
      stepId: 'cstep1',
      relatedSlug: 'deuxieme-consultation',
      hasNewConsultationPage: false,
    }
    const wrapper = shallow(<MetaStepNavigationBox {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
