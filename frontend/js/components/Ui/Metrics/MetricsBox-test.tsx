/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import MetricsBox from './MetricsBox'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<MetricsBox />', () => {
  it('should render data', () => {
    const wrapper = shallow(<MetricsBox color="grey" totalCount={100} icon="cap-file-1" label="que la miff" />)
    expect(wrapper).toMatchSnapshot()
  })
})
