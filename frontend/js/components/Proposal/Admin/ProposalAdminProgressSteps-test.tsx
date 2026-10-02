/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAdminProgressSteps } from './ProposalAdminProgressSteps'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalAdminProgressSteps />', () => {
  const props = {
    dispatch: jest.fn(),
    fields: {
      length: 0,
      map: () => [],
      remove: jest.fn(),
    },
    progressSteps: [],
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminProgressSteps {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
