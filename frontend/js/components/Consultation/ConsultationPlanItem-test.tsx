/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ConsultationPlanItem } from './ConsultationPlanItem'
import { $refType } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ConsultationPlanItem />', () => {
  const props = {
    section: {
      ' $refType': $refType,
      slug: 'slug',
      id: 'title',
      title: 'title',
    },
    activeItems: [],
    level: 0,
    onCollapse: jest.fn(),
  }
  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPlanItem {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
