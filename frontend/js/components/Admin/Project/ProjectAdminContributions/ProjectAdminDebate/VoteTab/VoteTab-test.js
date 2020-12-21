/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { VoteTab } from './VoteTab';
import { $fragmentRefs, $refType, relayPaginationMock } from '~/mocks';

const baseProps = {
  debate: {
    id: 'debate123',
    $refType,
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
            $fragmentRefs,
          },
        },
        {
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==2',
          node: {
            id: 'value456',
            type: 'AGAINST',
            $fragmentRefs,
          },
        },
      ],
    },
    debateVotesAgainst: {
      totalCount: 1,
    },
    debateVotesFor: {
      totalCount: 1,
    },
  },
  relay: relayPaginationMock,
};

const props = {
  basic: baseProps,
  noVote: {
    ...baseProps,
    debate: {
      ...baseProps.debate,
      debateVotes: {
        ...baseProps.debate.debateVotes,
        totalCount: 0,
        edges: [],
      },
      debateVotesAgainst: {
        totalCount: 0,
      },
      debateVotesFor: {
        totalCount: 0,
      },
    },
  },
};

describe('<VoteTab />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<VoteTab {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no argument', () => {
    const wrapper = shallow(<VoteTab {...props.noVote} />);
    expect(wrapper).toMatchSnapshot();
  });
});
