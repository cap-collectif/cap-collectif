/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ProposalNewsHeaderButtons from './ProposalNewsHeaderButtons'

describe('<ProposalNewsHeaderButtons />', () => {
  const props = {
    postId: 'aPost',
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalNewsHeaderButtons {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
