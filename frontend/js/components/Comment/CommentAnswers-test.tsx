/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { CommentAnswers } from './CommentAnswers'
import { $refType, $fragmentRefs } from '../../mocks'

const props = {
  comment: {
    ' $refType': $refType,
    id: 'proposalComment1',
    answers: {
      totalCount: 2,
      edges: [
        {
          node: {
            ' $fragmentRefs': $fragmentRefs,
            id: '1',
          },
        },
        {
          node: {
            ' $fragmentRefs': $fragmentRefs,
            id: '2',
          },
        },
      ],
    },
  },
  useBodyColor: true,
}
const propsWithoutAnswers = {
  comment: {
    ' $refType': $refType,
    id: 'proposalComment2',
    answers: {
      totalCount: 0,
      edges: [],
    },
  },
  useBodyColor: true,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<CommentAnswers />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentAnswers {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with no answers', () => {
    const wrapper = shallow(<CommentAnswers {...propsWithoutAnswers} />)
    expect(wrapper).toMatchSnapshot()
  })
})
