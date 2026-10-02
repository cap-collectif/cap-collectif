/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ProjectsListFilterStatus from './ProjectListFilterStatus'
import { intlMock } from '../../../../mocks'

const defaultPropsStatus = {
  status: null,
  intl: intlMock,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectsListFilterStatus />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectsListFilterStatus {...defaultPropsStatus} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with a selected status', () => {
    const wrapper = shallow(<ProjectsListFilterStatus {...defaultPropsStatus} status="1" />)
    expect(wrapper).toMatchSnapshot()
  })
})
