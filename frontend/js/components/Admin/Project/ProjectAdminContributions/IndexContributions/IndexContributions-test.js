/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { IndexContributions } from './IndexContributions';
import { $fragmentRefs, $refType } from '~/mocks';

const baseProps = {
  project: {
    $refType,
    steps: [
      {
        id: '123',
        __typename: 'CollectStep',
        slug: 'jesuisunslug1',
        $fragmentRefs,
      },
      {
        id: '456',
        __typename: 'SelectionStep',
        slug: 'jesuisunslug2',
        $fragmentRefs,
      },
      {
        id: '789',
        __typename: 'DebateStep',
        slug: 'jesuisunslug3',
        $fragmentRefs,
      },
    ],
  },
};

const props = {
  basic: baseProps,
};

describe('<IndexContributions />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<IndexContributions {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
