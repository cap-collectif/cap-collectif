/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Pane as ProposalMapDiscoverPane } from './ProposalMapDiscoverPane'
import { intlMock } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalMapDiscoverPane />', () => {
  it('should render correctly', () => {
    const props = {
      intl: intlMock,
      type: 'CLICK',
    }
    const wrapper = shallow(<ProposalMapDiscoverPane {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
