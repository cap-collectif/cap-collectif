/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { $refType, $fragmentRefs } from '../../../mocks'
import { ProfileReplyList } from './ProfileReplyList'

describe('<ProfileReplyList />', () => {
  const replies = {
    ' $refType': $refType,
    edges: [
      {
        node: {
          ' $fragmentRefs': $fragmentRefs,
        },
      },
    ],
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProfileReplyList replies={replies} />)
    expect(wrapper).toMatchSnapshot()
  })
})
