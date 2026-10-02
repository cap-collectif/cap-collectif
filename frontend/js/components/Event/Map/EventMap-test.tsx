/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { EventMap } from './EventMap'
import { $refType, relayPaginationMock, $fragmentRefs } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<EventMap />', () => {
  it('renders correctly', () => {
    const props = {
      relay: relayPaginationMock,
      query: {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        events: {
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'cursor1',
            endCursor: 'cursor2',
          },
          edges: [
            {
              node: {
                id: 'event1',
              },
            },
            {
              node: {
                id: 'event2',
              },
            },
          ],
        },
      },
    }
    const wrapper = shallow(<EventMap {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
