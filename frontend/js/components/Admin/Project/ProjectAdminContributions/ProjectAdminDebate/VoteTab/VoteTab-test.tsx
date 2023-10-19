/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { VoteTab } from './VoteTab'
import { $refType, relayPaginationMock } from '~/mocks'

const baseProps = {
  debate: {
    id: 'debate123',
    url: 'https://debate123.com',
    ' $refType': $refType,
    debateVotes: {
      totalCount: 2,
      pageInfo: {
        hasNextPage: false,
      },
      edges: [
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==1',
          node: {
            id: 'value123',
            type: 'FOR',
            published: true,
            publishedAt: '2050-03-01 12:00:00',
            createdAt: '2050-03-01 12:00:00',
            origin: 'INTERNAL',
            widgetOriginUrl: null,
            author: {
              username: 'vince-123',
            },
          },
        },
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==2',
          node: {
            id: 'value456',
            type: 'AGAINST',
            published: true,
            publishedAt: '2050-03-01 12:00:00',
            createdAt: '2050-03-01 12:00:00',
            origin: 'INTERNAL',
            widgetOriginUrl: null,
            author: {
              username: 'vince-123',
            },
          },
        },
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==3',
          node: {
            id: 'value789',
            type: 'AGAINST',
            published: false,
            publishedAt: null,
            createdAt: '2050-03-01 12:00:00',
            origin: 'INTERNAL',
            widgetOriginUrl: null,
          },
        },
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==4',
          node: {
            id: 'value987',
            type: 'AGAINST',
            published: true,
            publishedAt: '2050-03-01 12:00:00',
            createdAt: '2050-03-01 12:00:00',
            origin: 'MAIL',
            widgetOriginUrl: null,
            author: {
              username: 'vince-123',
            },
          },
        },
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==5',
          node: {
            id: 'value654',
            type: 'FOR',
            published: true,
            publishedAt: '2050-03-01 12:00:00',
            createdAt: '2050-03-01 12:00:00',
            origin: 'WIDGET',
            widgetOriginUrl: 'https://fr.reactjs.org/docs/fragments.html',
          },
        },
      ],
    },
  },
  debateStep: {
    ' $refType': $refType,
    id: 'debate-step-123',
    timeRange: {
      hasEnded: false,
    },
  },
  relay: relayPaginationMock,
}
const props = {
  basic: baseProps,
  noVote: {
    ...baseProps,
    debate: { ...baseProps.debate, debateVotes: { ...baseProps.debate.debateVotes, totalCount: 0, edges: [] } },
  },
  stepClosed: {
    ...baseProps,
    debateStep: {
      ...baseProps.debateStep,
      timeRange: {
        hasEnded: true,
      },
    },
  },
}
describe('<VoteTab />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<VoteTab {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when no vote', () => {
    const wrapper = shallow(<VoteTab {...props.noVote} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when step closed', () => {
    const wrapper = shallow(<VoteTab {...props.stepClosed} />)
    expect(wrapper).toMatchSnapshot()
  })
})
