/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { relayPaginationMock, $refType, $fragmentRefs } from '../../mocks'
import { OpinionVersionFollowersBox } from './OpinionVersionFollowersBox'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<OpinionVersionFollowersBox />', () => {
  const props = {
    relay: relayPaginationMock,
    version: {
      id: 'version',
      ' $refType': $refType,
      followers: {
        edges: [
          {
            cursor: 'cursor1',
            node: {
              id: 'user1',
              ' $fragmentRefs': $fragmentRefs,
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor1',
        },
        totalCount: 1,
      },
    },
  }
  const propsEmpty = {
    relay: relayPaginationMock,
    version: {
      id: 'version',
      ' $refType': $refType,
      followers: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor1',
        },
        totalCount: 0,
      },
    },
  }
  it('should render correctly', () => {
    const wrapper = shallow(<OpinionVersionFollowersBox {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render empty', () => {
    const wrapper = shallow(<OpinionVersionFollowersBox {...propsEmpty} />)
    expect(wrapper).toMatchSnapshot()
  })
})
