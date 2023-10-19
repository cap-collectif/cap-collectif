/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { DebateArgumentItem } from './DebateArgumentItem'
import { $refType, $fragmentRefs } from '~/mocks'

describe('<DebateArgumentItem />', () => {
  const defaultProps = {
    setDeleteModalInfo: jest.fn(),
    debateArgument: {
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      id: 'argumentPour42',
      body: 'Je suis pour',
      votes: {
        totalCount: 500,
      },
      debate: {
        id: 'debate-123',
        url: '/debate',
        step: {
          timeRange: {
            hasEnded: false,
          },
          id: 'step',
          title: 'Etape',
        },
      },
      type: 'FOR',
      viewerHasVote: false,
      viewerDidAuthor: false,
      publishedAt: '2018-04-09T23:21:06+0200',
    },
    isMobile: false,
  }
  const props = {
    basic: defaultProps,
    onMobile: { ...defaultProps, isMobile: true },
    stepClosed: {
      ...defaultProps,
      debateArgument: {
        ...defaultProps.debateArgument,
        debate: {
          ...defaultProps.debateArgument.debate,
          step: {
            ...defaultProps.debateArgument.debate.step,
            timeRange: {
              hasEnded: true,
            },
          },
        },
      },
    },
  }
  it('render correctly', () => {
    const wrapper = shallow(<DebateArgumentItem {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render correctly on mobile', () => {
    const wrapper = shallow(<DebateArgumentItem {...props.onMobile} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render correctly when step closed', () => {
    const wrapper = shallow(<DebateArgumentItem {...props.stepClosed} />)
    expect(wrapper).toMatchSnapshot()
  })
})
