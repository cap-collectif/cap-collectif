/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { Opinion } from './Opinion'
import { $refType, $fragmentRefs } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Opinion />', () => {
  const props = {
    showUpdatedDate: false,
    opinion: {
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      author: {
        vip: false,
      },
      votes: {
        totalCount: 0,
      },
      votesMitige: {
        totalCount: 0,
      },
      votesNok: {
        totalCount: 0,
      },
      votesOk: {
        totalCount: 0,
      },
    },
  }
  it('renders correcty', () => {
    const wrapper = shallow(<Opinion {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
