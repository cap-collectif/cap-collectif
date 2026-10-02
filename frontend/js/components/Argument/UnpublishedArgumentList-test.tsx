/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { UnpublishedArgumentList } from './UnpublishedArgumentList'
import { $refType, $fragmentRefs } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<UnpublishedArgumentList />', () => {
  it('renders nothing when empty', () => {
    const argumentable = {
      ' $refType': $refType,
      viewerArgumentsUnpublished: null,
    }
    const wrapper = shallow(<UnpublishedArgumentList type="FOR" argumentable={argumentable} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correcty', () => {
    const argumentable = {
      ' $refType': $refType,
      viewerArgumentsUnpublished: {
        totalCount: 1,
        edges: [
          {
            node: {
              ' $fragmentRefs': $fragmentRefs,
              id: 'argument1',
            },
          },
        ],
      },
    }
    const wrapper = shallow(<UnpublishedArgumentList type="FOR" argumentable={argumentable} />)
    expect(wrapper).toMatchSnapshot()
  })
})
