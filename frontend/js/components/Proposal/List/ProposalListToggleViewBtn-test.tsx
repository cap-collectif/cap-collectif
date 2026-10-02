/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalListToggleViewBtn } from './ProposalListToggleViewBtn'
import { $refType } from '~/mocks'

const baseProps = {
  showMapButton: true,
  displayMode: 'GRID',
  setDisplayMode: jest.fn(),
  step: {
    ' $refType': $refType,
    __typename: 'CollectStep',
    form: {
      isGridViewEnabled: true,
      isListViewEnabled: true,
      isMapViewEnabled: true,
    },
  },
}
const props = {
  basic: baseProps,
  withSelectionStep: {
    ...baseProps,
    step: {
      ' $refType': $refType,
      __typename: 'SelectionStep',
      project: {
        firstCollectStep: {
          form: {
            isGridViewEnabled: true,
            isListViewEnabled: true,
            isMapViewEnabled: true,
          },
        },
      },
    },
  },
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalListToggleViewBtn />', () => {
  it('should render a toggle button with grid selected', () => {
    const wrapper = shallow(<ProposalListToggleViewBtn {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when SelectionStep', () => {
    const wrapper = shallow(<ProposalListToggleViewBtn {...props.withSelectionStep} />)
    expect(wrapper).toMatchSnapshot()
  })
})
