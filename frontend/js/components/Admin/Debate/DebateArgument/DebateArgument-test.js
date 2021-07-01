/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { DebateArgument } from './DebateArgument';
import { $refType } from '~/mocks';

const baseProps = {
  argument: {
    $refType,
    id: 'argument-123',
    body: 'Bonjour bonjour',
    published: true,
    publishedAt: '2017-02-01 00:03:00',
    type: 'FOR',
    author: { id: 'vincero', username: 'Vince' },
    debate: {
      id: 'debate-123',
    },
  },
  setModerateArgumentModal: jest.fn(),
};

const props = {
  basic: baseProps,
  noPublished: {
    ...baseProps,
    argument: {
      ...baseProps.argument,
      published: false,
      publishedAt: null,
    },
  },
};

describe('<DebateArgument />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DebateArgument {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no published', () => {
    const wrapper = shallow(<DebateArgument {...props.noPublished} />);
    expect(wrapper).toMatchSnapshot();
  });
});
