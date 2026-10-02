/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { OpinionEditModal } from './OpinionEditModal'
import { intlMock, $refType, $fragmentRefs } from '../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<OpinionEditModal />', () => {
  const props = {
    intl: intlMock,
    show: true,
    opinion: {
      id: 'opinion1',
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
    },
    submitting: false,
    dispatch: jest.fn(),
  }
  it('renders correctly', () => {
    const wrapper = shallow(<OpinionEditModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
