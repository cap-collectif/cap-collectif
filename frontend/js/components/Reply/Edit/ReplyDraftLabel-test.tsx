/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ReplyDraftLabel from './ReplyDraftLabel'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ReplyDraftLabel />', () => {
  it('should render correctly with draft', () => {
    const wrapper = shallow(<ReplyDraftLabel draft />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with not draft', () => {
    const wrapper = shallow(<ReplyDraftLabel draft={false} />)
    expect(wrapper).toMatchSnapshot()
  })
})
