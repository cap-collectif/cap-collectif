/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalListSearch } from './ProposalListSearch'
import { intlMock } from '../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalListSearch />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    terms: 'This is some terms',
    intl: intlMock,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalListSearch {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
