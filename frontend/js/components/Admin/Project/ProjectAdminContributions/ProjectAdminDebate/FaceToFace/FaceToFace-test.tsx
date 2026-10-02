/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { FaceToFace } from './FaceToFace'
import { $fragmentRefs, $refType } from '~/mocks'

const baseProps = {
  debate: {
    id: 'debate123',
    ' $refType': $refType,
    opinions: {
      edges: [
        {
          node: {
            id: 'opinion123',
            type: 'FOR',
            ' $fragmentRefs': $fragmentRefs,
          },
        },
        {
          node: {
            id: 'opinion456',
            type: 'AGAINST',
            ' $fragmentRefs': $fragmentRefs,
          },
        },
      ],
    },
    ' $fragmentRefs': $fragmentRefs,
  },
}
const props = {
  basic: baseProps,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<FaceToFace />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<FaceToFace {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
