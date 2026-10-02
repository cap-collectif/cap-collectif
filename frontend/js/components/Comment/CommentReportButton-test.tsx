/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { CommentReportButton } from './CommentReportButton'
import { $refType } from '../../mocks'

const defaultProps = {
  dispatch: jest.fn(),
  comment: {
    ' $refType': $refType,
    id: '1',
    author: {
      slug: 'thisisaslug',
    },
  },
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<CommentReportButton />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentReportButton {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
