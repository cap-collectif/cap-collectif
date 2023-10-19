/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SectionList } from './SectionList'
import { $fragmentRefs } from '../../mocks'

describe('<SectionList />', () => {
  const props = {
    section: {
      sections: [
        {
          sections: [],
          ' $fragmentRefs': $fragmentRefs,
        },
      ],
      ' $fragmentRefs': $fragmentRefs,
    },
    consultation: {},
    level: 0,
  }
  it('renders correcty', () => {
    const wrapper = shallow(<SectionList {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
