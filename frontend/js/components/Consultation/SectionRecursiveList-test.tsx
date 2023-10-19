/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SectionRecursiveList } from './SectionRecursiveList'
import { $refType, $fragmentRefs } from '../../mocks'

describe('<SectionRecursiveList />', () => {
  const props = {
    consultation: {
      id: 'consultation',
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      sections: [
        {
          sections: [],
          ' $fragmentRefs': $fragmentRefs,
        },
        {
          sections: [],
          ' $fragmentRefs': $fragmentRefs,
        },
      ],
    },
  }
  it('renders correcty', () => {
    const wrapper = shallow(<SectionRecursiveList {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
