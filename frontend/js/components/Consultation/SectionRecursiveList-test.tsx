/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SectionRecursiveList } from './SectionRecursiveList'
import { $refType, $fragmentRefs } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
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
