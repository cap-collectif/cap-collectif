/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventPagePassedEventsPreview } from './EventPagePassedEventsPreview'
import { $refType, $fragmentRefs } from '../../../mocks'

describe('<EventPagePassedEventsPreviews />', () => {
  const props = {
    formName: 'formName',
    dispatch: jest.fn(),
    query: {
      ' $refType': $refType,
      previewPassedEvents: {
        totalCount: 3,
        edges: [
          {
            node: {
              ' $fragmentRefs': $fragmentRefs,
            },
          },
          {
            node: {
              ' $fragmentRefs': $fragmentRefs,
            },
          },
          {
            node: {
              ' $fragmentRefs': $fragmentRefs,
            },
          },
        ],
      },
    },
  }
  it('renders correctly when empty', () => {
    const emptyQuery = {
      ' $refType': $refType,
      previewPassedEvents: {
        totalCount: 0,
        edges: [],
      },
    }
    const wrapper = shallow(<EventPagePassedEventsPreview {...props} query={emptyQuery} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly', () => {
    const wrapper = shallow(<EventPagePassedEventsPreview {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
