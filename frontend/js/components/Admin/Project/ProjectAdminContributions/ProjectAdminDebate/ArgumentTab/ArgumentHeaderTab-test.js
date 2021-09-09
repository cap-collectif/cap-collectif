/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ArgumentHeaderTab } from './ArgumentHeaderTab';
import { $refType } from '~/mocks';

const baseProps = {
  debate: {
    id: 'debate123',
    $refType,
    debateArgumentsPublished: {
      totalCount: 2,
    },
    debateArgumentsWaiting: {
      totalCount: 2,
    },
    debateArgumentsTrashed: {
      totalCount: 2,
    },
    argumentsFor: {
      totalCount: 4,
    },
    argumentsAgainst: {
      totalCount: 2,
    },
  },
  debateStep: {
    $refType,
    timeRange: {
      hasEnded: false,
    },
  },
};

const props = {
  basic: baseProps,
  noVote: {
    ...baseProps,
    debate: {
      ...baseProps.debate,
      debateArgumentsPublished: {
        totalCount: 0,
      },
      debateArgumentsWaiting: {
        totalCount: 0,
      },
      argumentsFor: {
        totalCount: 0,
      },
      argumentsAgainst: {
        totalCount: 0,
      },
    },
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
};

describe('<ArgumentHeaderTab />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ArgumentHeaderTab {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no vote', () => {
    const wrapper = shallow(<ArgumentHeaderTab {...props.noVote} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with step closed', () => {
    const wrapper = shallow(<ArgumentHeaderTab {...props.stepClosed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
