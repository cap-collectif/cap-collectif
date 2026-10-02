/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectAdminRankingStepForm } from './ProjectAdminRankingStepForm'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectAdminRankingStepForm />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminRankingStepForm />)
    expect(wrapper).toMatchSnapshot()
  })
})
