/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectAdminRankingStepForm } from './ProjectAdminRankingStepForm'

describe('<ProjectAdminRankingStepForm />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminRankingStepForm />)
    expect(wrapper).toMatchSnapshot()
  })
})
