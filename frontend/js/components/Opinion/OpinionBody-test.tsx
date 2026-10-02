/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { $refType, $fragmentRefs } from '../../mocks'
import { OpinionBody } from './OpinionBody'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<OpinionBody />', () => {
  const props = {
    opinion: {
      __typename: 'Version',
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      comment: 'comment',
    },
  }
  it('should render correctly when the opinion is a version', () => {
    const wrapper = shallow(<OpinionBody {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
