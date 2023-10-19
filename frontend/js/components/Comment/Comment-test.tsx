/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Comment } from './Comment'
import { $refType, $fragmentRefs } from '../../mocks'

const props = {
  comment: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    moderationStatus: 'APPROVED',
    author: {
      ' $fragmentRefs': $fragmentRefs,
      displayName: 'admin',
      media: null,
      vip: true,
      isViewer: true,
    },
    id: 'proposalComment1',
  },
}
describe('<Comment />', () => {
  it('should render correctly highlighted', () => {
    const comment = {
      id: 'comment1',
      moderationStatus: 'APPROVED',
      author: {
        ' $fragmentRefs': $fragmentRefs,
        vip: true,
        displayName: 'jcVandam',
        media: {
          url: 'http://perdu.com/image.jpg',
        },
        isViewer: true,
      },
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    }
    const wrapper = shallow(<Comment comment={comment} isHighlighted />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly not highlighted', () => {
    const comment = {
      id: 'comment2',
      moderationStatus: 'APPROVED',
      author: {
        ' $fragmentRefs': $fragmentRefs,
        vip: true,
        displayName: 'jcVandam',
        media: null,
        isViewer: true,
      },
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    }
    const wrapper = shallow(<Comment comment={comment} isHighlighted={false} />)
    wrapper.setState({
      answerFormShown: true,
    })
    expect(wrapper).toMatchSnapshot()
  })
  describe('<Comment /> shown and focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />)
      wrapper.setState({
        answerFormShown: true,
        answerFormFocus: true,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('<Comment /> not shown and focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />)
      wrapper.setState({
        answerFormShown: false,
        answerFormFocus: true,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('<Comment /> shown and not focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />)
      wrapper.setState({
        answerFormShown: true,
        answerFormFocus: false,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('<Comment /> not shown and not focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />)
      wrapper.setState({
        answerFormShown: false,
        answerFormFocus: false,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
