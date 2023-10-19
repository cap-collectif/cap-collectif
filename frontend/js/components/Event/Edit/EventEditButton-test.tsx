/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventEditButton } from './EventEditButton'
import { $refType, $fragmentRefs } from '~/mocks'

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
