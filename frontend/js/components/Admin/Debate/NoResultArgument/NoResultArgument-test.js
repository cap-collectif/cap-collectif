/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { NoResultArgument } from './NoResultArgument';
import { $refType } from '~/mocks';

const baseProps = {
  debate: {
    $refType,
    debateArgumentsAgainst: {
      totalCount: 1,
    },
    debateArgumentsFor: {
      totalCount: 1,
    },
  },
};

const props = {
  basic: baseProps,
  noArgument: {
    ...baseProps,
    debate: {
      ...baseProps.debate,
      debateArgumentsAgainst: {
        totalCount: 0,
      },
      debateArgumentsFor: {
        totalCount: 0,
      },
    },
  },
};

describe('<NoResultArgument />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<NoResultArgument {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no argument', () => {
    const wrapper = shallow(<NoResultArgument {...props.noArgument} />);
    expect(wrapper).toMatchSnapshot();
  });
});
