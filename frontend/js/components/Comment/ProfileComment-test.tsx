/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProfileComment } from './ProfileComment'
import { $fragmentRefs, $refType } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProfileComment />', () => {
  it('should render correctly', () => {
    const comment = {
      id: 'comment1',
      author: {
        ' $fragmentRefs': $fragmentRefs,
      },
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    }
    const wrapper = shallow(<ProfileComment comment={comment} />)
    expect(wrapper).toMatchSnapshot()
  })
})
