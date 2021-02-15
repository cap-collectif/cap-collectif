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
    timeless: false,
    timeRange: {
      endAt: '2030-03-10 00:00:00',
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
      debateArgumentsTrashed: {
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
  timelessStep: {
    ...baseProps,
    debateStep: {
      ...baseProps.debateStep,
      timeless: true,
      timeRange: {
        endAt: null,
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

  it('should render correctly with timeless date for step', () => {
    const wrapper = shallow(<ArgumentHeaderTab {...props.timelessStep} />);
    expect(wrapper).toMatchSnapshot();
  });
});
