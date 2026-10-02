/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DebateOpinion } from './DebateOpinion'
import { $fragmentRefs, $refType } from '~/mocks'

const baseProps = {
  debateOpinion: {
    ' $refType': $refType,
    type: 'FOR',
    title: 'Thats my opinion',
    body: 'Thats it',
    author: {
      username: 'Emmanuel Macron',
      ' $fragmentRefs': $fragmentRefs,
    },
  },
  onEdit: jest.fn(),
  onDelete: jest.fn(),
}
const props = {
  basic: baseProps,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DebateOpinion />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DebateOpinion {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
