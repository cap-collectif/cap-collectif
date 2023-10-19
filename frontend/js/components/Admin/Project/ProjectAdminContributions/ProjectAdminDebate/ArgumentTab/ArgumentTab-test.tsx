/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ArgumentTab } from './ArgumentTab'
import { $fragmentRefs, $refType, relayPaginationMock } from '~/mocks'

const baseProps = {
  debate: {
    id: 'debate123',
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    debateArguments: {
      totalCount: 2,
      pageInfo: {
        hasNextPage: false,
      },
      edges: [
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==1',
          node: {
            id: 'argument123',
            ' $fragmentRefs': $fragmentRefs,
          },
        },
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==2',
          node: {
            id: 'argument456',
            ' $fragmentRefs': $fragmentRefs,
          },
        },
      ],
    },
    allArguments: {
      totalCount: 2,
    },
  },
  relay: relayPaginationMock,
}
const props = {
  basic: baseProps,
  noArgument: {
    ...baseProps,
    debate: {
      ...baseProps.debate,
      debateArguments: { ...baseProps.debate.debateArguments, totalCount: 0, edges: [] },
      allArguments: {
        totalCount: 0,
      },
    },
  },
}
describe('<ArgumentTab />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ArgumentTab {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when no argument', () => {
    const wrapper = shallow(<ArgumentTab {...props.noArgument} />)
    expect(wrapper).toMatchSnapshot()
  })
})
