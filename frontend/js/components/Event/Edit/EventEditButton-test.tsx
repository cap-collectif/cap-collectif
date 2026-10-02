/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventEditButton } from './EventEditButton'
import { $refType, $fragmentRefs } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<EventEditButton />', () => {
  it('it renders correctly', () => {
    const props = {
      event: {
        author: {
          slug: '/metal',
        },
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
      query: {
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
    }
    const wrapper = shallow(<EventEditButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
