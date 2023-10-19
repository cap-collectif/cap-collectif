/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ReplyLink } from './ReplyLink'
import { $refType, $fragmentRefs } from '~/mocks'

const reply = {
  ' $refType': $refType,
  createdAt: '2016-03-01 10:11:12',
  publishedAt: '2016-04-25 14:33:17',
  id: 'replay1',
  private: false,
  draft: false,
  viewerCanDelete: true,
  ' $fragmentRefs': $fragmentRefs,
  __typename: 'UserReply',
}
const questionnaire = {
  ' $refType': $refType,
  ' $fragmentRefs': $fragmentRefs,
}
const notContribuableReply = { ...reply, viewerCanDelete: false }
describe('<ReplyLink />', () => {
  it('render a reply in a contribuable questionnaire', () => {
    const wrapper = shallow(<ReplyLink reply={reply} questionnaire={questionnaire} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render a draft reply in a contribuable questionnaire', () => {
    const wrapper = shallow(
      <ReplyLink reply={{ ...reply, draft: true, publishedAt: null }} questionnaire={questionnaire} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('render a private reply in a contribuable questionnaire', () => {
    const wrapper = shallow(<ReplyLink reply={{ ...reply, private: true }} questionnaire={questionnaire} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render a reply in a closed questionnaire', () => {
    const wrapper = shallow(<ReplyLink reply={notContribuableReply} questionnaire={questionnaire} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render a draft reply in a closed questionnaire', () => {
    const wrapper = shallow(
      <ReplyLink reply={{ ...notContribuableReply, draft: true, publishedAt: null }} questionnaire={questionnaire} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
