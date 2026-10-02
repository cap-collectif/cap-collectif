/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { CommentAnswer } from './CommentAnswer'
import { $refType, $fragmentRefs } from '../../mocks'

const props = {
  comment: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    author: {
      ' $fragmentRefs': $fragmentRefs,
      displayName: 'admin',
      vip: true,
    },
    id: 'proposalComment1',
  },
  useBodyColor: false,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<CommentAnswer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentAnswer {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
